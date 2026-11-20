import { getCharacters, revalidateCharacters } from "@/actions/characters";
import { getFavouriteIds } from "@/actions/favourites";
import { getSession } from "@/lib/auth/session";
import { CharacterCard } from "./CharacterCard";
import { CharacterPagination } from "./CharacterPagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { parsePageNumber } from "@/lib/pagination";

interface CharacterListProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const CharacterList = async ({ searchParams }: CharacterListProps) => {
  const page = parsePageNumber((await searchParams).page);
  const [{ characters, totalPages }, session] = await Promise.all([
    getCharacters(page),
    getSession(),
  ]);
  const favouriteIds = new Set(
    session ? await getFavouriteIds(characters.map(({ id }) => id)) : [],
  );

  if (characters.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        No characters found.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <form action={revalidateCharacters} className="flex justify-end">
        <Button type="submit" variant="outline" size="sm">
          Refresh characters
        </Button>
      </form>
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {characters.map((character) => (
          <li key={character.id}>
            <CharacterCard
              character={character}
              favourited={session ? favouriteIds.has(character.id) : undefined}
            />
          </li>
        ))}
      </ul>
      <CharacterPagination currentPage={page} totalPages={totalPages} />
    </div>
  );
};

export const CharacterListSkeleton = () => {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <li key={index}>
          <Skeleton className="h-48 w-full rounded-xl" />
        </li>
      ))}
    </ul>
  );
};
