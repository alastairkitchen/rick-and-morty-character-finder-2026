import { Suspense } from "react";

import { CharacterListSkeleton } from "@/app/features/characters/CharacterList";
import { FavouritesList } from "@/app/features/favourites/FavouritesList";

const FavouritesPage = ({ searchParams }: PageProps<"/favourites">) => {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your favourites
        </h1>
        <p className="text-muted-foreground">
          Characters you have favourited. Select cards to remove several at
          once.
        </p>
      </header>
      <Suspense fallback={<CharacterListSkeleton />}>
        <FavouritesList searchParams={searchParams} />
      </Suspense>
    </div>
  );
};

export default FavouritesPage;
