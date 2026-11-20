import { parsePageNumber } from "@/lib/pagination";
import { normaliseQuery } from "@/lib/search";
import { getCharacters } from "@/actions/characters";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parsePageNumber(searchParams.get("page"));
  const query = normaliseQuery(searchParams.get("q"));

  try {
    return Response.json(await getCharacters(page, query));
  } catch {
    return Response.json(
      { error: "Failed to fetch characters" },
      { status: 502 },
    );
  }
}
