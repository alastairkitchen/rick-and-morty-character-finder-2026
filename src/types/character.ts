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
