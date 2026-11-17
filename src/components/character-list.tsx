import { CharacterCard } from "@/components/character-card";
import { CharacterPagination } from "@/components/character-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { parsePage } from "@/lib/pagination";
import { getCharacters } from "@/lib/rick-and-morty";

interface CharacterListProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function CharacterList({ searchParams }: CharacterListProps) {
  const page = parsePage((await searchParams).page);
  const { characters, totalPages } = await getCharacters(page);

  if (characters.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        No characters found.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {characters.map((character) => (
          <li key={character.id}>
            <CharacterCard character={character} />
          </li>
        ))}
      </ul>
      <CharacterPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}

export function CharacterListSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index}>
          <Skeleton className="h-48 w-full rounded-xl" />
        </li>
      ))}
    </ul>
  );
}
