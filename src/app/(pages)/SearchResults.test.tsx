import { act, render, screen } from "@testing-library/react";

import { SearchResults } from "./SearchResults";
import {
  SearchTransitionProvider,
  useSearchTransition,
} from "./SearchTransitionProvider";

let finish: () => void;

const Trigger = () => {
  const { startTransition } = useSearchTransition();

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await new Promise<void>((resolve) => {
            finish = resolve;
          });
        })
      }
    >
      search
    </button>
  );
};

describe("SearchResults", () => {
  it("shows a spinner while a search is pending and swaps content after", async () => {
    render(
      <SearchTransitionProvider>
        <Trigger />
        <SearchResults>
          <p>cards</p>
        </SearchResults>
      </SearchTransitionProvider>,
    );

    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.getByText("cards")).toBeInTheDocument();

    await act(async () => screen.getByRole("button").click());
    expect(screen.getByRole("status")).toBeInTheDocument();

    await act(async () => finish());
    expect(screen.queryByRole("status")).toBeNull();
  });
});
