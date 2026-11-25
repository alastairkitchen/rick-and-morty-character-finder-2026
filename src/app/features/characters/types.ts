export type CharacterStatus = "Alive" | "Dead" | "unknown";

export type CharacterGender = "Female" | "Male" | "Genderless" | "unknown";

export interface LocationReference {
  id: number | null;
  name: string;
}

export interface CharacterDocument {
  _id: number;
  name: string;
  status: CharacterStatus;
  species: string;
  type: string;
  gender: CharacterGender;
  origin: LocationReference;
  location: LocationReference;
  image: string;
  episodeIds: number[];
}

export interface LocationDocument {
  _id: number;
  name: string;
  type: string;
  dimension: string;
}

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
