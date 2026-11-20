import { getCharacters, revalidateCharacters } from "./actions";
import { getFavouriteIds } from "@/app/features/favourites/actions";
import { getSession } from "@/app/features/auth/session";
import { CharacterCard } from "./CharacterCard";
import { CharacterPagination } from "@/app/features/pagination/CharacterPagination";
import { Filters } from "@/app/features/filters/Filters";
import { SearchResults } from "@/app/features/filters/SearchResults";
import { SearchTransitionProvider } from "@/app/features/filters/SearchTransitionProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { parsePageNumber } from "@/app/features/pagination/pagination";
import { normaliseQuery } from "@/app/features/filters/search";

interface CharacterListProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const CharacterList = async ({ searchParams }: CharacterListProps) => {
  const params = await searchParams;
  const page = parsePageNumber(params.page);
  const query = normaliseQuery(params.q);
  const [{ characters, totalPages }, session] = await Promise.all([
    getCharacters(page, query),
    getSession(),
  ]);
  const favouriteIds = new Set(
    session ? await getFavouriteIds(characters.map(({ id }) => id)) : [],
  );

  return (
    <SearchTransitionProvider>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <Filters query={query} />
        </div>
        <SearchResults>
          {characters.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">
              {query
                ? `No characters match "${query}".`
                : "No characters found."}
            </p>
          ) : (
            <>
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {characters.map((character) => (
                  <li key={character.id}>
                    <CharacterCard
                      character={character}
                      favourited={
                        session ? favouriteIds.has(character.id) : undefined
                      }
                    />
                  </li>
                ))}
              </ul>
              <CharacterPagination
                currentPage={page}
                totalPages={totalPages}
                query={query}
              />
            </>
          )}
        </SearchResults>
      </div>
    </SearchTransitionProvider>
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
