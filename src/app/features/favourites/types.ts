export interface CharacterFavourite {
  userId: string;
  characterId: number;
  createdAt: Date;
}

export type SetFavouriteResult = { ok: true } | { ok: false; error: string };
