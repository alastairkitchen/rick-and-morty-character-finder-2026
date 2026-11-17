import { getPageItems, parsePage } from "@/lib/pagination";

describe("parsePage", () => {
  it.each([
    ["3", 3],
    [["4", "5"], 4],
    ["0", 1],
    ["-2", 1],
    ["1.5", 1],
    ["abc", 1],
    [undefined, 1],
    [null, 1],
  ])("parses %p as %p", (input, expected) => {
    expect(parsePage(input)).toBe(expected);
  });
});

describe("getPageItems", () => {
  it("returns empty for no pages", () => {
    expect(getPageItems(1, 0)).toEqual([]);
  });

  it("returns all pages when few", () => {
    expect(getPageItems(1, 3)).toEqual([1, 2, 3]);
  });

  it("adds end ellipsis near start", () => {
    expect(getPageItems(1, 10)).toEqual([1, 2, "ellipsis-end", 10]);
  });

  it("adds both ellipses in middle", () => {
    expect(getPageItems(5, 10)).toEqual([
      1,
      "ellipsis-start",
      4,
      5,
      6,
      "ellipsis-end",
      10,
    ]);
  });

  it("adds start ellipsis near end", () => {
    expect(getPageItems(10, 10)).toEqual([1, "ellipsis-start", 9, 10]);
  });
});
