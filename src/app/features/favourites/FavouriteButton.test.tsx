import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { setFavourite } from "./actions";
import type { SetFavouriteResult } from "./types";
import { FavouriteButton } from "./FavouriteButton";

jest.mock("./actions", () => ({ setFavourite: jest.fn() }));

const mockSetFavourite = setFavourite as jest.MockedFunction<
  typeof setFavourite
>;

const deferred = () => {
  let resolve!: (value: SetFavouriteResult) => void;
  const promise = new Promise<SetFavouriteResult>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

const renderButton = (favourited: boolean) =>
  render(
    <FavouriteButton
      characterId={1}
      characterName="Rick Sanchez"
      favourited={favourited}
    />,
  );

describe("FavouriteButton", () => {
  beforeEach(() => mockSetFavourite.mockReset());

  it("has no red background when not favourited", () => {
    renderButton(false);
    const button = screen.getByRole("button", {
      name: "Add Rick Sanchez to favourites",
    });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).not.toHaveClass("bg-red-500");
  });

  it("has a red background when favourited", () => {
    renderButton(true);
    expect(screen.getByRole("button")).toHaveClass("bg-red-500");
  });

  it("calls setFavourite with the desired state", async () => {
    mockSetFavourite.mockResolvedValue({ ok: true });
    renderButton(false);

    await userEvent.click(screen.getByRole("button"));

    expect(mockSetFavourite).toHaveBeenCalledWith(1, true);
  });

  it("shows the favourite optimistically while the action is pending", async () => {
    const { promise, resolve } = deferred();
    mockSetFavourite.mockReturnValue(promise);
    renderButton(false);

    await userEvent.click(screen.getByRole("button"));

    const button = screen.getByRole("button", {
      name: "Remove Rick Sanchez from favourites",
    });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveClass("bg-red-500");
    expect(button).toBeDisabled();

    await act(async () => resolve({ ok: true }));
  });

  it("rolls back and shows an error when the action fails", async () => {
    const { promise, resolve } = deferred();
    mockSetFavourite.mockReturnValue(promise);
    renderButton(false);

    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");

    await act(async () =>
      resolve({ ok: false, error: "Could not update favourite." }),
    );

    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not update favourite.",
    );
  });
});
