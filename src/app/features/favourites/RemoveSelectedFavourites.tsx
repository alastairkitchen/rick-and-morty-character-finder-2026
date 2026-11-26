"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmRemoveDialog } from "./ConfirmRemoveDialog";
import { useFavouritesSelection } from "./FavouritesSelectionProvider";

export const RemoveSelectedFavourites = () => {
  const { selectedIds, isPending, error, remove } = useFavouritesSelection();
  const count = selectedIds.size;

  return (
    <div className="flex items-center gap-3">
      {count > 0 && (
        <ConfirmRemoveDialog
          title={`Remove ${count} ${count === 1 ? "favourite" : "favourites"}?`}
          description="The selected characters will be removed from your favourites."
          onConfirm={() => remove([...selectedIds])}
          trigger={
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              className="cursor-pointer"
            >
              <Trash2 data-icon="inline-start" />
              Remove ({count})
            </Button>
          }
        />
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};
