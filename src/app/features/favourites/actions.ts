"use server";

import { MongoServerError } from "mongodb";
import { cacheLife, cacheTag, updateTag } from "next/cache";

import { getSession } from "@/app/features/auth/session";
import {
  CARD_FIELDS,
  ORIGIN_LOOKUP,
  toCharacter,
  type CardDocument,
} from "@/app/features/characters/cardQuery";
import { CHARACTERS_COLLECTION } from "@/app/features/characters/getCharactersCollection";
import type {
  Character,
  CharactersPage,
} from "@/app/features/characters/types";
import {
  normaliseQuery,
  searchCharactersByName,
} from "@/app/features/filters/search";
import {
  PAGE_SIZE,
  parsePageNumber,
} from "@/app/features/pagination/pagination";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { getFavouritesCollection } from "./getFavouritesCollection";
import type { SetFavouriteResult } from "./types";

const MAX_CHARACTER_IDS = 100;
const DUPLICATE_KEY_ERROR = 11000;

const isCharacterId = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0;

const isCharacterIdList = (value: unknown): value is number[] =>
  Array.isArray(value) &&
  value.length <= MAX_CHARACTER_IDS &&
  value.every(isCharacterId);

async function getCachedFavouriteCharacters(
  userId: string,
): Promise<Character[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.favourites(userId), CACHE_TAGS.characters);

  const collection = await getFavouritesCollection();
  const documents = await collection
    .aggregate<CardDocument>([
      { $match: { userId } },
      { $sort: { createdAt: -1, characterId: 1 } },
      {
        $lookup: {
          from: CHARACTERS_COLLECTION,
          localField: "characterId",
          foreignField: "_id",
          pipeline: [
            { $project: { name: 1, status: 1, species: 1, image: 1, origin: 1 } },
          ],
          as: "character",
        },
      },
      { $unwind: "$character" },
      { $replaceRoot: { newRoot: "$character" } },
      ORIGIN_LOOKUP,
      { $project: CARD_FIELDS },
    ])
    .toArray();

  return documents.map(toCharacter);
}

async function getCachedFavouriteIds(
  userId: string,
  characterIds: number[],
): Promise<number[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.favourites(userId));

  const collection = await getFavouritesCollection();
  const favourites = await collection
    .find(
      { userId, characterId: { $in: characterIds } },
      { projection: { _id: 0, characterId: 1 } },
    )
    .toArray();

  return favourites.map(({ characterId }) => characterId);
}

export async function getFavouriteIds(
  characterIds: number[],
): Promise<number[]> {
  const session = await getSession();
  if (!session) return [];

  if (!isCharacterIdList(characterIds) || characterIds.length === 0) {
    return [];
  }

  return getCachedFavouriteIds(session.user.id, characterIds);
}

export async function getFavouriteCharacters(
  page: number,
  query?: string,
): Promise<CharactersPage> {
  const session = await getSession();
  if (!session) {
    return { characters: [], page: 1, totalPages: 0, totalCount: 0 };
  }

  const normalisedQuery = normaliseQuery(query);
  const favourites = await getCachedFavouriteCharacters(session.user.id);
  const matches = normalisedQuery
    ? searchCharactersByName(favourites, normalisedQuery)
    : favourites;

  const totalPages = Math.ceil(matches.length / PAGE_SIZE);
  // Removing the last cards on the last page must not leave an empty page.
  const pageNumber = Math.min(parsePageNumber(page), Math.max(totalPages, 1));
  const start = (pageNumber - 1) * PAGE_SIZE;

  return {
    characters: matches.slice(start, start + PAGE_SIZE),
    page: pageNumber,
    totalPages,
    totalCount: matches.length,
  };
}

export async function getFavouriteIdCount(userId: string): Promise<number[]> {
  const collection = await getFavouritesCollection();
  const favourites = await collection
    .find({ userId }, { projection: { _id: 0, characterId: 1 } })
    .toArray();

  return favourites.map(({ characterId }) => characterId);
}

export async function setFavourite(
  characterId: number,
  favourited: boolean,
): Promise<SetFavouriteResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "Sign in to save favourites." };
  }

  if (!isCharacterId(characterId) || typeof favourited !== "boolean") {
    return { ok: false, error: "Invalid request." };
  }

  const userId = session.user.id;

  try {
    const collection = await getFavouritesCollection();

    if (favourited) {
      await collection.updateOne(
        { userId, characterId },
        { $setOnInsert: { createdAt: new Date() } },
        { upsert: true },
      );
    } else {
      await collection.deleteOne({ userId, characterId });
    }
  } catch (error) {
    if (
      !(error instanceof MongoServerError && error.code === DUPLICATE_KEY_ERROR)
    ) {
      console.error("setFavourite failed", error);
      return { ok: false, error: "Could not update favourite." };
    }
  }

  updateTag(CACHE_TAGS.favourites(userId));
  return { ok: true };
}

export async function removeFavourites(
  characterIds: number[],
): Promise<SetFavouriteResult> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: "Sign in to manage favourites." };
  }

  if (!isCharacterIdList(characterIds) || characterIds.length === 0) {
    return { ok: false, error: "Invalid request." };
  }

  const userId = session.user.id;

  try {
    const collection = await getFavouritesCollection();
    await collection.deleteMany({
      userId,
      characterId: { $in: [...new Set(characterIds)] },
    });
  } catch (error) {
    console.error("removeFavourites failed", error);
    return { ok: false, error: "Could not remove favourites." };
  }

  updateTag(CACHE_TAGS.favourites(userId));
  return { ok: true };
}
