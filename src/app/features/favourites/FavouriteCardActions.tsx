"use client";

import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmRemoveDialog } from "./ConfirmRemoveDialog";
import { useFavouritesSelection } from "./FavouritesSelectionProvider";

interface FavouriteCardActionsProps {
  characterId: number;
  characterName: string;
}

export const FavouriteCardActions = ({
  characterId,
  characterName,
}: FavouriteCardActionsProps) => {
  const { selectedIds, isPending, setSelected, remove } =
    useFavouritesSelection();
  const label = `Remove ${characterName} from favourites`;

  return (
    <div className="flex items-center gap-3">
      <ConfirmRemoveDialog
        title={`Remove ${characterName}?`}
        description={`${characterName} will be removed from your favourites.`}
        onConfirm={() => remove([characterId])}
        trigger={
          <Button
            type="button"
            variant="outline"
            aria-label={label}
            title={label}
            disabled={isPending}
            className="cursor-pointer border-red-500 bg-red-500 text-white hover:bg-red-600 hover:text-white dark:border-red-500 dark:bg-red-500 dark:hover:bg-red-600"
          >
            <Heart aria-hidden />
          </Button>
        }
      />
      <Checkbox
        aria-label={`Select ${characterName}`}
        checked={selectedIds.has(characterId)}
        disabled={isPending}
        onCheckedChange={(checked) => setSelected(characterId, checked)}
        className="size-5 cursor-pointer"
      />
    </div>
  );
};
