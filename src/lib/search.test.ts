import { getHomeHref, normaliseQuery, searchCharactersByName } from "@/lib/search";
import type { Character } from "@/types/character";

const character = (id: number, name: string): Character => ({
  id,
  name,
  status: "Alive",
  species: "Human",
  origin: { name: "Earth" },
  image: "",
});

const characters = [
  character(1, "Rick Sanchez"),
  character(2, "Morty Smith"),
  character(3, "Summer Smith"),
  character(4, "Beth Smith"),
  character(5, "Jerry Smith"),
];

describe("normaliseQuery", () => {
  it.each([
    ["  rick   sanchez ", "rick sanchez"],
    [["morty", "rick"], "morty"],
    ["", ""],
    [undefined, ""],
    [null, ""],
  ])("normalises %p to %p", (input, expected) => {
    expect(normaliseQuery(input)).toBe(expected);
  });

  it("limits length", () => {
    expect(normaliseQuery("a".repeat(200))).toHaveLength(50);
  });
});

describe("searchCharactersByName", () => {
  it("matches exact names", () => {
    expect(searchCharactersByName(characters, "Morty")[0].id).toBe(2);
  });

  it("tolerates typos", () => {
    expect(searchCharactersByName(characters, "Rik Sanches")[0].id).toBe(1);
  });

  it("matches partial names anywhere", () => {
    const ids = searchCharactersByName(characters, "smith").map(({ id }) => id);
    expect(ids).toEqual(expect.arrayContaining([2, 3, 4, 5]));
  });

  it("returns nothing for unrelated text", () => {
    expect(searchCharactersByName(characters, "zzzzqqqq")).toEqual([]);
  });
});

describe("getHomeHref", () => {
  it.each([
    [{}, "/"],
    [{ page: 1 }, "/"],
    [{ page: 3 }, "/?page=3"],
    [{ query: "rick" }, "/?q=rick"],
    [{ query: "rick sanchez", page: 2 }, "/?q=rick+sanchez&page=2"],
  ])("builds %p as %p", (input, expected) => {
    expect(getHomeHref(input)).toBe(expected);
  });
});
