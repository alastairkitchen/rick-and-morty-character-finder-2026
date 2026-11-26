import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { removeFavourites } from "./actions";
import { FavouriteCardActions } from "./FavouriteCardActions";
import { FavouritesSelectionProvider } from "./FavouritesSelectionProvider";
import { RemoveSelectedFavourites } from "./RemoveSelectedFavourites";
import { SelectableFavouriteItem } from "./SelectableFavouriteItem";
import type { SetFavouriteResult } from "./types";

jest.mock("./actions", () => ({ removeFavourites: jest.fn() }));

const mockRemoveFavourites = removeFavourites as jest.MockedFunction<
  typeof removeFavourites
>;

const characters = [
  { id: 1, name: "Rick Sanchez" },
  { id: 2, name: "Morty Smith" },
  { id: 3, name: "Summer Smith" },
];

const deferred = () => {
  let resolve!: (value: SetFavouriteResult) => void;
  const promise = new Promise<SetFavouriteResult>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

const renderFavourites = () =>
  render(
    <FavouritesSelectionProvider>
      <RemoveSelectedFavourites />
      <ul>
        {characters.map(({ id, name }) => (
          <SelectableFavouriteItem key={id} characterId={id}>
            <p>{name}</p>
            <FavouriteCardActions characterId={id} characterName={name} />
          </SelectableFavouriteItem>
        ))}
      </ul>
    </FavouritesSelectionProvider>,
  );

const confirmRemove = async () =>
  userEvent.click(
    within(await screen.findByRole("alertdialog")).getByRole("button", {
      name: "Remove",
    }),
  );

describe("favourites selection", () => {
  beforeEach(() => mockRemoveFavourites.mockReset());

  it("asks for confirmation before removing a single favourite", async () => {
    const { promise, resolve } = deferred();
    mockRemoveFavourites.mockReturnValue(promise);
    renderFavourites();

    await userEvent.click(
      screen.getByRole("button", { name: "Remove Morty Smith from favourites" }),
    );
    expect(mockRemoveFavourites).not.toHaveBeenCalled();

    await confirmRemove();

    expect(mockRemoveFavourites).toHaveBeenCalledWith([2]);
    expect(screen.queryByText("Morty Smith")).not.toBeInTheDocument();

    await act(async () => resolve({ ok: true }));
  });

  it("keeps the favourite when the dialog is cancelled", async () => {
    renderFavourites();

    await userEvent.click(
      screen.getByRole("button", { name: "Remove Rick Sanchez from favourites" }),
    );
    await userEvent.click(
      within(await screen.findByRole("alertdialog")).getByRole("button", {
        name: "Cancel",
      }),
    );

    expect(mockRemoveFavourites).not.toHaveBeenCalled();
    expect(screen.getByText("Rick Sanchez")).toBeInTheDocument();
  });

  it("scales selected cards and shows the bulk remove button", async () => {
    renderFavourites();
    expect(
      screen.queryByRole("button", { name: /^Remove \(/ }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("checkbox", { name: "Select Rick Sanchez" }),
    );

    expect(screen.getByText("Rick Sanchez").closest("li")).toHaveClass(
      "scale-[1.03]",
    );
    expect(screen.getByText("Morty Smith").closest("li")).not.toHaveClass(
      "scale-[1.03]",
    );
    expect(
      screen.getByRole("button", { name: "Remove (1)" }),
    ).toBeInTheDocument();
  });

  it("removes all selected favourites after confirmation", async () => {
    const { promise, resolve } = deferred();
    mockRemoveFavourites.mockReturnValue(promise);
    renderFavourites();

    await userEvent.click(
      screen.getByRole("checkbox", { name: "Select Rick Sanchez" }),
    );
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Select Summer Smith" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove (2)" }));
    await confirmRemove();

    expect(mockRemoveFavourites).toHaveBeenCalledWith([1, 3]);
    expect(screen.queryByText("Rick Sanchez")).not.toBeInTheDocument();
    expect(screen.queryByText("Summer Smith")).not.toBeInTheDocument();
    expect(screen.getByText("Morty Smith")).toBeInTheDocument();

    await act(async () => resolve({ ok: true }));
  });

  it("restores the cards and shows an error when removal fails", async () => {
    const { promise, resolve } = deferred();
    mockRemoveFavourites.mockReturnValue(promise);
    renderFavourites();

    await userEvent.click(
      screen.getByRole("checkbox", { name: "Select Rick Sanchez" }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove (1)" }));
    await confirmRemove();
    expect(screen.queryByText("Rick Sanchez")).not.toBeInTheDocument();

    await act(async () =>
      resolve({ ok: false, error: "Could not remove favourites." }),
    );

    expect(screen.getByText("Rick Sanchez")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not remove favourites.",
    );
    expect(
      screen.getByRole("checkbox", { name: "Select Rick Sanchez" }),
    ).toBeChecked();
  });
});
