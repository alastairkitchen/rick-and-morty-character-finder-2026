import "server-only";
import Image from "next/image";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FavouriteButton } from "@/app/features/favourites/FavouriteButton";

import type { Character, CharacterStatus } from "./types";
import { cn } from "@/lib/utils";

const statusDotClass: Record<CharacterStatus, string> = {
  Alive: "bg-green-500",
  Dead: "bg-red-500",
  unknown: "bg-gray-400",
};

interface CharacterCardProps {
  character: Character;
  favourited?: boolean;
  // Replaces the default favourite button, for example on the favourites page.
  actions?: ReactNode;
}

export const CharacterCard = async ({
  character,
  favourited,
  actions,
}: CharacterCardProps) => {
  const { id, name, status, species, origin, image } = character;

  return (
    <Card className="h-full flex-row gap-0 py-0">
      <div className="relative w-2/5 shrink-0">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(min-width: 1024px) 14vw, (min-width: 640px) 20vw, 40vw"
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 py-4">
        <CardHeader>
          <CardTitle className="truncate text-lg" title={name}>
            {name}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <span
              data-testid="status-dot"
              aria-hidden
              className={cn("size-2.5 rounded-full", statusDotClass[status])}
            />
            <span>{status === "unknown" ? "Unknown" : status}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <p className="text-muted-foreground">Species</p>
            <p>{species}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Origin</p>
            <p>{origin.name}</p>
          </div>
          {actions ??
            (favourited !== undefined && (
              <FavouriteButton
                characterId={id}
                characterName={name}
                favourited={favourited}
              />
            ))}
        </CardContent>
      </div>
    </Card>
  );
};
