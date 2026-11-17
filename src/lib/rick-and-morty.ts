import { cacheLife } from "next/cache";

const API_URL = "https://rickandmortyapi.com/api";

export type CharacterStatus = "Alive" | "Dead" | "unknown";

export interface Character {
  id: number;
  name: string;
  status: CharacterStatus;
  species: string;
  origin: { name: string };
  image: string;
}

export interface CharactersPage {
  characters: Character[];
  page: number;
  totalPages: number;
  totalCount: number;
}

interface ApiResponse {
  info: { count: number; pages: number };
  results: Character[];
}

export async function getCharacters(page: number): Promise<CharactersPage> {
  "use cache";
  cacheLife("hours");

  const response = await fetch(`${API_URL}/character?page=${page}`);

  // The API returns 404 when the page has no results.
  if (response.status === 404) {
    return { characters: [], page, totalPages: 0, totalCount: 0 };
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
    page,
    totalPages: data.info.pages,
    totalCount: data.info.count,
  };
}
