export const CACHE_TAGS = {
  characters: "characters",
  favourites: (userId: string) => `favourites:${userId}`,
} as const;
