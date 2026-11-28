"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useFavouritesSelection } from "./FavouritesSelectionProvider";

interface SelectableFavouriteItemProps {
  characterId: number;
  children: ReactNode;
}

export const SelectableFavouriteItem = ({
  characterId,
  children,
}: SelectableFavouriteItemProps) => {
  const { selectedIds, removedIds } = useFavouritesSelection();

  if (removedIds.has(characterId)) return null;

  const selected = selectedIds.has(characterId);

  return (
    <li
      data-selected={selected}
      className={cn(
        "rounded-xl transition-transform duration-200",
        selected && "z-10 scale-[0.95] ring-2 ring-primary",
      )}
    >
      {children}
    </li>
  );
};
