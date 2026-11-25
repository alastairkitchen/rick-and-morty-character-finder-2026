import type { Db } from "mongodb";

import type {
  CharacterDocument,
  CharacterGender,
  CharacterStatus,
  LocationDocument,
  LocationReference,
} from "@/app/features/characters/types";
import { db, mongoClient } from "@/lib/mongodb/mongodb";

const API_URL = "https://rickandmortyapi.com/api";
const CHARACTERS_COLLECTION = "characters";
const LOCATIONS_COLLECTION = "locations";

interface ApiPage<T> {
  info: { next: string | null };
  results: T[];
}

interface ApiCharacter {
  id: number;
  name: string;
  status: CharacterStatus;
  species: string;
  type: string;
  gender: CharacterGender;
  origin: { name: string; url: string };
  location: { name: string; url: string };
  image: string;
  episode: string[];
}

interface ApiLocation {
  id: number;
  name: string;
  type: string;
  dimension: string;
}

const MAX_RETRIES = 5;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// The API rate limits bursts with 429.
const fetchWithRetry = async (url: string): Promise<Response> => {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url);
    if (response.status !== 429 || attempt >= MAX_RETRIES) return response;

    const retryAfter = Number(response.headers.get("retry-after"));
    await sleep(retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 1000);
  }
};

const fetchAll = async <T>(resource: string): Promise<T[]> => {
  const items: T[] = [];
  let url: string | null = `${API_URL}/${resource}`;

  while (url) {
    const response: Response = await fetchWithRetry(url);
    if (!response.ok) {
      throw new Error(`${url} responded with ${response.status}`);
    }
    const page = (await response.json()) as ApiPage<T>;
    items.push(...page.results);
    url = page.info.next;
  }

  return items;
};

// The API uses an empty url for unknown locations.
const idFromUrl = (url: string): number | null => {
  const id = Number(url.split("/").pop());
  return url && Number.isInteger(id) ? id : null;
};

const toLocationReference = (location: {
  name: string;
  url: string;
}): LocationReference => ({
  id: idFromUrl(location.url),
  name: location.name,
});

const toCharacterDocument = (character: ApiCharacter): CharacterDocument => ({
  _id: character.id,
  name: character.name,
  status: character.status,
  species: character.species,
  type: character.type,
  gender: character.gender,
  origin: toLocationReference(character.origin),
  location: toLocationReference(character.location),
  image: character.image,
  episodeIds: character.episode.map((url) => Number(url.split("/").pop())),
});

const toLocationDocument = (location: ApiLocation): LocationDocument => ({
  _id: location.id,
  name: location.name,
  type: location.type,
  dimension: location.dimension,
});

const locationReferenceSchema = {
  bsonType: "object",
  required: ["id", "name"],
  properties: {
    id: { bsonType: ["int", "long", "double", "null"] },
    name: { bsonType: "string" },
  },
};

const characterSchema = {
  bsonType: "object",
  required: [
    "_id",
    "name",
    "status",
    "species",
    "type",
    "gender",
    "origin",
    "location",
    "image",
    "episodeIds",
  ],
  properties: {
    name: { bsonType: "string" },
    status: { enum: ["Alive", "Dead", "unknown"] },
    species: { bsonType: "string" },
    type: { bsonType: "string" },
    gender: { enum: ["Female", "Male", "Genderless", "unknown"] },
    origin: locationReferenceSchema,
    location: locationReferenceSchema,
    image: { bsonType: "string" },
    episodeIds: { bsonType: "array" },
  },
};

const locationSchema = {
  bsonType: "object",
  required: ["_id", "name", "type", "dimension"],
  properties: {
    name: { bsonType: "string" },
    type: { bsonType: "string" },
    dimension: { bsonType: "string" },
  },
};

const ensureValidatedCollection = async (
  database: Db,
  name: string,
  schema: object,
) => {
  const validator = { $jsonSchema: schema };
  const exists = await database.listCollections({ name }).hasNext();

  if (exists) {
    await database.command({ collMod: name, validator });
  } else {
    await database.createCollection(name, { validator });
  }
};

async function main() {
  console.log("Fetching from rickandmortyapi.com...");
  const apiCharacters = await fetchAll<ApiCharacter>("character");
  const apiLocations = await fetchAll<ApiLocation>("location");

  const characters = apiCharacters.map(toCharacterDocument);
  const locations = apiLocations.map(toLocationDocument);

  await ensureValidatedCollection(db, LOCATIONS_COLLECTION, locationSchema);
  await ensureValidatedCollection(db, CHARACTERS_COLLECTION, characterSchema);

  const locationsCollection = db.collection<LocationDocument>(
    LOCATIONS_COLLECTION,
  );
  const charactersCollection = db.collection<CharacterDocument>(
    CHARACTERS_COLLECTION,
  );

  await locationsCollection.bulkWrite(
    locations.map((location) => ({
      replaceOne: {
        filter: { _id: location._id },
        replacement: location,
        upsert: true,
      },
    })),
  );
  await charactersCollection.bulkWrite(
    characters.map((character) => ({
      replaceOne: {
        filter: { _id: character._id },
        replacement: character,
        upsert: true,
      },
    })),
  );

  await charactersCollection.createIndexes([
    { key: { name: 1 } },
    { key: { "origin.id": 1 } },
    { key: { "location.id": 1 } },
  ]);

  const locationIds = new Set(locations.map((location) => location._id));
  const dangling = characters.filter(
    ({ origin, location }) =>
      (origin.id !== null && !locationIds.has(origin.id)) ||
      (location.id !== null && !locationIds.has(location.id)),
  );

  console.log(
    `Seeded ${characters.length} characters and ${locations.length} locations`,
  );
  if (dangling.length > 0) {
    console.warn(
      `${dangling.length} characters reference a missing location: ${dangling
        .map(({ _id }) => _id)
        .join(", ")}`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoClient.close());
