"use server";

import { cacheLife, cacheTag, updateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { parsePage } from "@/lib/pagination";
import type { Character, CharactersPage } from "@/types/character";

const API_URL = "https://rickandmortyapi.com/api";

interface ApiResponse {
  info: { count: number; pages: number };
  results: Character[];
}

export async function getCharacters(page: number): Promise<CharactersPage> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.characters);

  const parsedPage = parsePage(page);

  console.dir(`${API_URL}/character?page=${parsedPage}`);
  const response = await fetch(`${API_URL}/character?page=${parsedPage}`);

  // The API returns 404 when the page has no results.
  if (response.status === 404) {
    return { characters: [], page: parsedPage, totalPages: 0, totalCount: 0 };
  }
  if (!response.ok) {
    throw new Error(`Rick and Morty API responded with ${response.status}`);
  }

  const data: ApiResponse = await response.json();
  return {
    characters: data.results.map(
      ({ id, name, status, species, origin, image }) => ({
        id,
        name,
        status,
        species,
        origin: { name: origin.name },
        image,
      }),
    ),
    page: parsedPage,
    totalPages: data.info.pages,
    totalCount: data.info.count,
  };
}

export async function revalidateCharacters(): Promise<void> {
  // updateTag expires immediately so the re-rendered route reads fresh data.
  updateTag(CACHE_TAGS.characters);
}
