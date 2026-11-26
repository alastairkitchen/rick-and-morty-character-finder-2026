"use server";

import { cacheLife, cacheTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { PAGE_SIZE, parsePageNumber } from "../pagination/pagination";
import { normaliseQuery, searchCharactersByName } from "../filters/search";
import { getCharactersCollection } from "./getCharactersCollection";
import {
  CARD_FIELDS,
  ORIGIN_LOOKUP,
  toCharacter,
  type CardDocument,
} from "./actions-utils";
import type { Character, CharactersPage } from "./types";

async function getCharactersByPage(page: number): Promise<CharactersPage> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.characters);

  const collection = getCharactersCollection();
  // Paginate before the lookup so only one page of locations is joined.
  const [documents, totalCount] = await Promise.all([
    collection
      .aggregate<CardDocument>([
        { $sort: { _id: 1 } },
        { $skip: (page - 1) * PAGE_SIZE },
        { $limit: PAGE_SIZE },
        ORIGIN_LOOKUP,
        { $project: CARD_FIELDS },
      ])
      .toArray(),
    collection.countDocuments(),
  ]);

  return {
    characters: documents.map(toCharacter),
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
    .aggregate<CardDocument>([
      { $sort: { _id: 1 } },
      ORIGIN_LOOKUP,
      { $project: CARD_FIELDS },
    ])
    .toArray();

  return documents.map(toCharacter);
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
