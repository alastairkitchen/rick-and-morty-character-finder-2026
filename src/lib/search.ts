import Fuse from "fuse.js";

import type { Character } from "@/types/character";

export const MAX_QUERY_LENGTH = 50;

export const normaliseQuery = (
  value: string | string[] | null | undefined,
): string => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH).trimEnd();
};

export const searchCharactersByName = (
  characters: Character[],
  query: string,
): Character[] =>
  new Fuse(characters, {
    keys: ["name"],
    threshold: 0.3,
    // Match anywhere in the name, not just near the start.
    ignoreLocation: true,
  })
    .search(query)
    .map(({ item }) => item);

export const getHomeHref = ({
  query = "",
  page = 1,
}: {
  query?: string;
  page?: number;
}): string => {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/?${search}` : "/";
};
