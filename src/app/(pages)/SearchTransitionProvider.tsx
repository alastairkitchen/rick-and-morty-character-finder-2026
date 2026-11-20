"use client";

import {
  createContext,
  useContext,
  useTransition,
  type ReactNode,
  type TransitionStartFunction,
} from "react";

interface SearchTransition {
  isPending: boolean;
  startTransition: TransitionStartFunction;
}

const SearchTransitionContext = createContext<SearchTransition | null>(null);

// Shares one transition between the search box and the results it reloads.
export const SearchTransitionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isPending, startTransition] = useTransition();

  return (
    <SearchTransitionContext value={{ isPending, startTransition }}>
      {children}
    </SearchTransitionContext>
  );
};

export const useSearchTransition = (): SearchTransition => {
  const context = useContext(SearchTransitionContext);
  if (!context) {
    throw new Error(
      "useSearchTransition must be used within SearchTransitionProvider",
    );
  }
  return context;
};
