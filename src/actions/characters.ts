"use server";

import { cacheLife, cacheTag, updateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { PAGE_SIZE, parsePageNumber } from "@/lib/pagination";
import { normaliseQuery, searchCharactersByName } from "@/lib/search";
import type { Character, CharactersPage } from "@/types/character";

const API_URL = "https://rickandmortyapi.com/api";

interface ApiResponse {
  info: { count: number; pages: number };
  results: Character[];
}

const toCharacter = ({
  id,
  name,
  status,
  species,
  origin,
  image,
}: Character): Character => ({
  id,
  name,
  status,
  species,
  origin: { name: origin.name },
  image,
});

// The API returns 404 when the page has no results.
const fetchApiPage = async (page: number): Promise<ApiResponse | null> => {
  const response = await fetch(`${API_URL}/character?page=${page}`);

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Rick and Morty API responded with ${response.status}`);
  }
  return response.json();
};

async function fetchCharactersPage(page: number): Promise<CharactersPage> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.characters);

  const data = await fetchApiPage(page);
  if (!data) return { characters: [], page, totalPages: 0, totalCount: 0 };

  return {
    characters: data.results.map(toCharacter),
    page,
    totalPages: data.info.pages,
    totalCount: data.info.count,
  };
}

// The API only supports exact substring filtering, so fuzzy search needs the full list.
async function fetchAllCharacters(): Promise<Character[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.characters);

  const first = await fetchApiPage(1);
  if (!first) return [];

  const rest = await Promise.all(
    Array.from({ length: first.info.pages - 1 }, (_, index) =>
      fetchApiPage(index + 2),
    ),
  );

  return [first, ...rest].flatMap(
    (data) => data?.results.map(toCharacter) ?? [],
  );
}

async function searchCharactersPage(
  query: string,
  page: number,
): Promise<CharactersPage> {
  const matches = searchCharactersByName(await fetchAllCharacters(), query);
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
  // Action inputs are untrusted; normalise before use.
  const pageNumber = parsePageNumber(page);
  const normalisedQuery = normaliseQuery(query);

  return normalisedQuery
    ? searchCharactersPage(normalisedQuery, pageNumber)
    : fetchCharactersPage(pageNumber);
}

export async function revalidateCharacters(): Promise<void> {
  // updateTag expires immediately so the re-rendered route reads fresh data.
  updateTag(CACHE_TAGS.characters);
}
