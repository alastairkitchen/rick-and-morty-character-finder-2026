import { parsePage } from "@/lib/pagination";
import { getCharacters } from "@/lib/rick-and-morty";

export async function GET(request: Request) {
  const page = parsePage(new URL(request.url).searchParams.get("page"));

  try {
    return Response.json(await getCharacters(page));
  } catch {
    return Response.json(
      { error: "Failed to fetch characters" },
      { status: 502 },
    );
  }
}
