"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { getHomeHref, normaliseQuery } from "@/lib/search";

import { useSearchTransition } from "./SearchTransitionProvider";

export const SEARCH_DEBOUNCE_MS = 500;

interface FiltersProps {
  query: string;
}

export const Filters = ({ query }: FiltersProps) => {
  const router = useRouter();
  const { isPending, startTransition } = useSearchTransition();
  const [value, setValue] = useState(query);
  const [pushed, setPushed] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);

  if (query !== syncedQuery) {
    setSyncedQuery(query);
    if (query !== pushed) {
      setPushed(query);
      setValue(query);
    }
  }

  useEffect(() => {
    const next = normaliseQuery(value);
    if (next === pushed) return;

    const timeout = setTimeout(() => {
      setPushed(next);
      startTransition(() => {
        router.replace(getHomeHref({ query: next }), { scroll: false });
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [value, pushed, router, startTransition]);

  return (
    <div className="w-full max-w-sm">
      <Input
        type="search"
        aria-label="Search characters by name"
        placeholder="Search characters by name"
        autoComplete="off"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-busy={isPending}
      />
    </div>
  );
};
