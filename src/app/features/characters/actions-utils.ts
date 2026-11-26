import "server-only";

import type { Character, CharacterDocument } from "./types";

const LOCATIONS_COLLECTION = "locations";

export const CARD_FIELDS = {
  name: 1,
  status: 1,
  species: 1,
  image: 1,
  originName: {
    $ifNull: [{ $first: "$originLocation.name" }, "$origin.name"],
  },
} as const;

export const ORIGIN_LOOKUP = {
  $lookup: {
    from: LOCATIONS_COLLECTION,
    localField: "origin.id",
    foreignField: "_id",
    pipeline: [{ $project: { name: 1 } }],
    as: "originLocation",
  },
} as const;

export type CardDocument = Pick<
  CharacterDocument,
  "_id" | "name" | "status" | "species" | "image"
> & { originName: string };

export const toCharacter = ({
  _id,
  name,
  status,
  species,
  originName,
  image,
}: CardDocument): Character => ({
  id: _id,
  name,
  status,
  species,
  origin: { name: originName },
  image,
});
