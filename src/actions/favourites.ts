"use server";

import { MongoServerError } from "mongodb";
import { cacheLife, cacheTag, updateTag } from "next/cache";

import { getSession } from "@/lib/auth/session";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  getFavouritesCollection,
  isCharacterId,
} from "@/lib/mongodb/getFavouritesCollection";
import type { SetFavouriteResult } from "@/types/favourite";

const MAX_CHARACTER_IDS = 100;
const DUPLICATE_KEY_ERROR = 11000;

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

// Returns which of the given characters the signed-in user has favourited.
export async function getFavouriteIds(characterIds: number[]): Promise<number[]> {
  const session = await getSession();
  if (!session) return [];

  if (
    !Array.isArray(characterIds) ||
    characterIds.length > MAX_CHARACTER_IDS ||
    !characterIds.every(isCharacterId)
  ) {
    return [];
  }
  if (characterIds.length === 0) return [];

  return getCachedFavouriteIds(session.user.id, characterIds);
}

// Sets the desired state rather than toggling, so retries are idempotent.
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
    // Two concurrent upserts can race; the favourite exists either way.
    if (!(error instanceof MongoServerError && error.code === DUPLICATE_KEY_ERROR)) {
      console.error("setFavourite failed", error);
      return { ok: false, error: "Could not update favourite." };
    }
  }

  updateTag(CACHE_TAGS.favourites(userId));
  return { ok: true };
}
