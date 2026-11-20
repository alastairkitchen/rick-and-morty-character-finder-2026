import "server-only";

import { db } from "@/lib/mongodb/mongodb";
import type { CharacterFavourite } from "@/types/favourite";

export const FAVOURITES_COLLECTION = "characterFavourite";

let indexesReady: Promise<string> | undefined;

export const getFavouritesCollection = async () => {
  const collection = db.collection<CharacterFavourite>(FAVOURITES_COLLECTION);

  if (indexesReady === undefined) {
    indexesReady = collection
      .createIndex({ userId: 1, characterId: 1 }, { unique: true }, undefined)
      .catch((error) => {
        indexesReady = undefined;
        throw error;
      });
  }

  await indexesReady;
  return collection;
};

export const isCharacterId = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0;
