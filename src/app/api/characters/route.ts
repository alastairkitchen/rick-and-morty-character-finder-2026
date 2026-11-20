import { parsePageNumber } from "@/lib/pagination";
import { getCharacters } from "@/actions/characters";

export async function GET(request: Request) {
  const page = parsePageNumber(new URL(request.url).searchParams.get("page"));

  try {
    return Response.json(await getCharacters(page));
  } catch {
    return Response.json(
      { error: "Failed to fetch characters" },
      { status: 502 },
    );
  }
}
