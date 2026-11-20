"use client";

import { Heart } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";

import { setFavourite } from "@/actions/favourites";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FavouriteButtonProps {
  characterId: number;
  characterName: string;
  favourited: boolean;
}

export const FavouriteButton = ({
  characterId,
  characterName,
  favourited,
}: FavouriteButtonProps) => {
  const [optimisticFavourited, setOptimisticFavourited] =
    useOptimistic(favourited);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    const nextValue = !optimisticFavourited;
    setError(null);
    startTransition(async () => {
      setOptimisticFavourited(nextValue);
      try {
        const result = await setFavourite(characterId, nextValue);
        if (!result.ok) setError(result.error);
      } catch {
        setError("Could not update favourite.");
      }
    });
  };

  const label = optimisticFavourited
    ? `Remove ${characterName} from favourites`
    : `Add ${characterName} to favourites`;

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant="outline"
        aria-label={label}
        aria-pressed={optimisticFavourited}
        title={label}
        disabled={isPending}
        onClick={handleClick}
        className={cn(
          optimisticFavourited &&
            "border-red-500 bg-red-500 text-white hover:bg-red-600 hover:text-white dark:border-red-500 dark:bg-red-500 dark:hover:bg-red-600",
        )}
      >
        <Heart aria-hidden />
      </Button>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};
