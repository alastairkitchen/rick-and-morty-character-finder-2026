import { Suspense } from "react";

import {
  CharacterList,
  CharacterListSkeleton,
} from "@/app/features/characters/CharacterList";
import Link from "next/link";
import { getSession } from "../features/auth/session";

const Home = async ({ searchParams }: PageProps<"/">) => {
  const session = await getSession();

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Rick and Morty Character Finder
        </h1>
      </header>
      <section
        aria-label="About"
        className="mb-10 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-10 text-white sm:px-10"
      >
        <h2 className="text-2xl font-semibold">
          Explore the multiverse, one character at a time
        </h2>
        <p className="mt-2 max-w-2xl text-white/90">
          Browse and serach every character from Rick and Morty. See who is
          alive, who is dead, where they come from, and what species they are.
        </p>

        {session ? (
          <p className="mt-2 max-w-2xl text-white/90">
            Add favourite characters by clicking the heart button on character
            cards. View and manage your favourites on the{" "}
            <Link className="underline" href="/favourites">
              Favourites
            </Link>{" "}
            screen.
          </p>
        ) : (
          <p className="mt-2 max-w-2xl text-white/90">
            Log in to create and manage favourite characters. Dont have an
            account? You can create one by signing up from the{" "}
            <Link className="underline" href="/login">
              log in
            </Link>{" "}
            screen.
          </p>
        )}
      </section>
      <Suspense fallback={<CharacterListSkeleton />}>
        <CharacterList searchParams={searchParams} />
      </Suspense>
    </div>
  );
};

export default Home;
