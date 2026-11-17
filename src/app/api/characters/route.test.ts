/** @jest-environment node */
import { GET } from "@/app/api/characters/route";
import { getCharacters } from "@/actions/characters";

jest.mock("@/actions/characters", () => ({ getCharacters: jest.fn() }));

const mockGetCharacters = getCharacters as jest.Mock;

describe("GET /api/characters", () => {
  beforeEach(() => mockGetCharacters.mockReset());

  it("returns characters for requested page", async () => {
    const payload = {
      characters: [],
      page: 2,
      totalPages: 42,
      totalCount: 826,
    };
    mockGetCharacters.mockResolvedValue(payload);

    const response = await GET(
      new Request("http://localhost/api/characters?page=2"),
    );

    expect(mockGetCharacters).toHaveBeenCalledWith(2);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(payload);
  });

  it("defaults invalid page to 1", async () => {
    mockGetCharacters.mockResolvedValue({});

    await GET(new Request("http://localhost/api/characters?page=abc"));

    expect(mockGetCharacters).toHaveBeenCalledWith(1);
  });

  it("returns 502 when upstream fails", async () => {
    mockGetCharacters.mockRejectedValue(new Error("boom"));

    const response = await GET(new Request("http://localhost/api/characters"));

    expect(response.status).toBe(502);
  });
});
