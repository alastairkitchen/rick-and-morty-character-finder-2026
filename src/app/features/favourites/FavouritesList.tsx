import { redirect } from "next/navigation";

import { getSession } from "@/app/features/auth/session";
import { CharacterCard } from "@/app/features/characters/CharacterCard";
import { Filters } from "@/app/features/filters/Filters";
import { normaliseQuery } from "@/app/features/filters/search";
import { SearchResults } from "@/app/features/filters/SearchResults";
import { SearchTransitionProvider } from "@/app/features/filters/SearchTransitionProvider";
import { CharacterPagination } from "@/app/features/pagination/CharacterPagination";
import { parsePageNumber } from "@/app/features/pagination/pagination";
import { getFavouriteCharacters } from "./actions";
import { FavouriteCardActions } from "./FavouriteCardActions";
import { FavouritesSelectionProvider } from "./FavouritesSelectionProvider";
import { RemoveSelectedFavourites } from "./RemoveSelectedFavourites";
import { SelectableFavouriteItem } from "./SelectableFavouriteItem";

export const FAVOURITES_PATH = "/favourites";

interface FavouritesListProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const FavouritesList = async ({ searchParams }: FavouritesListProps) => {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const query = normaliseQuery(params.q);
  const { characters, page, totalPages } = await getFavouriteCharacters(
    parsePageNumber(params.page),
    query,
  );

  return (
    <SearchTransitionProvider>
      {/* The key resets the selection when the page or search changes. */}
      <FavouritesSelectionProvider key={`${page}:${query}`}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <Filters query={query} basePath={FAVOURITES_PATH} />
            <RemoveSelectedFavourites />
          </div>
          <SearchResults>
            {characters.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground">
                {query
                  ? `No favourites match "${query}".`
                  : "You have no favourite characters yet."}
              </p>
            ) : (
              <>
                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {characters.map((character) => (
                    <SelectableFavouriteItem
                      key={character.id}
                      characterId={character.id}
                    >
                      <CharacterCard
                        character={character}
                        actions={
                          <FavouriteCardActions
                            characterId={character.id}
                            characterName={character.name}
                          />
                        }
                      />
                    </SelectableFavouriteItem>
                  ))}
                </ul>
                <CharacterPagination
                  currentPage={page}
                  totalPages={totalPages}
                  query={query}
                  basePath={FAVOURITES_PATH}
                />
              </>
            )}
          </SearchResults>
        </div>
      </FavouritesSelectionProvider>
    </SearchTransitionProvider>
  );
};
