"use client";

import {
  createContext,
  useContext,
  useOptimistic,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import { removeFavourites } from "./actions";

const REMOVE_ERROR = "Could not remove favourites.";

interface FavouritesSelection {
  selectedIds: ReadonlySet<number>;
  removedIds: ReadonlySet<number>;
  isPending: boolean;
  error: string | null;
  setSelected: (characterId: number, selected: boolean) => void;
  remove: (characterIds: number[]) => void;
}

const FavouritesSelectionContext = createContext<FavouritesSelection | null>(
  null,
);

const EMPTY_IDS: ReadonlySet<number> = new Set();

// Holds the selected cards and hides removed cards until the server confirms.
export const FavouritesSelectionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<number>>(
    EMPTY_IDS,
  );
  const [removedIds, addRemovedIds] = useOptimistic(
    EMPTY_IDS,
    (current, characterIds: number[]) => new Set([...current, ...characterIds]),
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const setSelected = (characterId: number, selected: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (selected) next.add(characterId);
      else next.delete(characterId);
      return next;
    });
  };

  const remove = (characterIds: number[]) => {
    if (characterIds.length === 0) return;
    setError(null);
    startTransition(async () => {
      addRemovedIds(characterIds);
      try {
        const result = await removeFavourites(characterIds);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setSelectedIds((current) => {
          const next = new Set(current);
          characterIds.forEach((id) => next.delete(id));
          return next;
        });
      } catch {
        setError(REMOVE_ERROR);
      }
    });
  };

  return (
    <FavouritesSelectionContext
      value={{ selectedIds, removedIds, isPending, error, setSelected, remove }}
    >
      {children}
    </FavouritesSelectionContext>
  );
};

export const useFavouritesSelection = (): FavouritesSelection => {
  const context = useContext(FavouritesSelectionContext);
  if (!context) {
    throw new Error(
      "useFavouritesSelection must be used within FavouritesSelectionProvider",
    );
  }
  return context;
};
