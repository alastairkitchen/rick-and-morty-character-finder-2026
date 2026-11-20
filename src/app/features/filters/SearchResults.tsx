"use client";

import type { ReactNode } from "react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { useSearchTransition } from "./SearchTransitionProvider";

export const SearchResults = ({ children }: { children: ReactNode }) => {
  const { isPending } = useSearchTransition();

  return (
    <div aria-busy={isPending}>
      <div className="flex h-8 items-center justify-center">
        {isPending && <Spinner className="size-6" />}
      </div>
      <div
        className={cn(
          "space-y-8 transition-opacity",
          isPending && "pointer-events-none opacity-50",
        )}
      >
        {children}
      </div>
    </div>
  );
};
