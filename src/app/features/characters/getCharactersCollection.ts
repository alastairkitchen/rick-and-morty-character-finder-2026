import "server-only";

import { db } from "@/lib/mongodb/mongodb";
import type { CharacterDocument } from "./types";

export const CHARACTERS_COLLECTION = "characters";

export const getCharactersCollection = () =>
  db.collection<CharacterDocument>(CHARACTERS_COLLECTION);
