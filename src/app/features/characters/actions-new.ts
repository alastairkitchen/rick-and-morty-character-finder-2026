"use server";

import { db } from "@/lib/mongodb/mongodb";
import { PAGE_SIZE } from "../pagination/pagination";

export async function getAllCharacters(page: number) {
  const characters = db.collection("characters");

  const agregatedData = await characters
    .aggregate([
      {
        $lookup: {
          from: "locations",
          localField: "origin.id",
          foreignField: "_id",
          as: "originLocation",
        },
      },
      {
        $lookup: {
          from: "locations",
          localField: "location.id",
          foreignField: "_id",
          as: "currentLocation",
        },
      },
      {
        $unwind: {
          path: "$originLocation",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$currentLocation",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: 1,
          status: 1,
          species: 1,
          gender: 1,
          image: 1,
          originLocation: 1,
          currentLocation: 1,
        },
      },
      { $skip: (page - 1) * PAGE_SIZE },
      { $limit: PAGE_SIZE },
    ])
    .toArray();

  return agregatedData.map((character) => ({
    id: character._id,
    name: character.name,
    status: character.status,
    species: character.species,
    origin: { name: character.originLocation?.name },
    image: character.image,
  }));
}

export async function getTotalPages() {
  const characters = db.collection("characters");

  const [totalPages] = await characters
    .aggregate([{ $count: "characters" }])
    .toArray();

  return Math.ceil(totalPages?.characters / PAGE_SIZE);
}
