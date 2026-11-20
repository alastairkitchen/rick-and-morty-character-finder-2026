"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { getHomeHref, normaliseQuery } from "@/lib/search";

export const SEARCH_DEBOUNCE_MS = 1000;

interface FiltersProps {
  query: string;
}

export const Filters = ({ query }: FiltersProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(query);
  // Last query this component pushed to the URL.
  const [pushed, setPushed] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);

  // URL changed by something else (back/forward): reset the input to match.
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
      // Omitting `page` resets to page 1; an empty query shows all characters.
      startTransition(() => {
        router.replace(getHomeHref({ query: next }), { scroll: false });
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [value, pushed, router]);

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
      <p className="mt-1 h-4 text-xs text-muted-foreground" role="status">
        {isPending ? "Searching..." : ""}
      </p>
    </div>
  );
};
