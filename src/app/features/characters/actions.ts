"use server";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { PAGE_SIZE, parsePageNumber } from "../pagination/pagination";
import { normaliseQuery, searchCharactersByName } from "../filters/search";
import { getCharactersCollection } from "./getCharactersCollection";
import type { Character, CharacterDocument, CharactersPage } from "./types";

const CARD_PROJECTION = {
  name: 1,
  status: 1,
  species: 1,
  "origin.name": 1,
  image: 1,
} as const;

type CardDocument = Pick<
  CharacterDocument,
  "_id" | "name" | "status" | "species" | "image"
> & { origin: { name: string } };

const toCharacter = ({
  _id,
  name,
  status,
  species,
  origin,
  image,
}: CardDocument): Character => ({
  id: _id,
  name,
  status,
  species,
  origin: { name: origin.name },
  image,
});

async function getCharactersByPage(page: number): Promise<CharactersPage> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.characters);

  const collection = getCharactersCollection();
  const [documents, totalCount] = await Promise.all([
    collection
      .find({}, { projection: CARD_PROJECTION })
      .sort({ _id: 1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .toArray(),
    collection.countDocuments(),
  ]);

  return {
    characters: (documents as CardDocument[]).map(toCharacter),
    page,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
    totalCount,
  };
}

async function getAllCharactersFromDb(): Promise<Character[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.characters);

  const documents = await getCharactersCollection()
    .find({}, { projection: CARD_PROJECTION })
    .sort({ _id: 1 })
    .toArray();

  return (documents as CardDocument[]).map(toCharacter);
}

async function searchCharactersByPage(
  query: string,
  page: number,
): Promise<CharactersPage> {
  const matches = searchCharactersByName(await getAllCharactersFromDb(), query);
  const start = (page - 1) * PAGE_SIZE;

  return {
    characters: matches.slice(start, start + PAGE_SIZE),
    page,
    totalPages: Math.ceil(matches.length / PAGE_SIZE),
    totalCount: matches.length,
  };
}

export async function getCharacters(
  page: number,
  query?: string,
): Promise<CharactersPage> {
  const pageNumber = parsePageNumber(page);
  const normalisedQuery = normaliseQuery(query);

  return normalisedQuery
    ? searchCharactersByPage(normalisedQuery, pageNumber)
    : getCharactersByPage(pageNumber);
}
