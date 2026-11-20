import { render, screen } from "@testing-library/react";

import { CharacterCard } from "./CharacterCard";
import type { Character } from "@/types/character";

jest.mock("@/actions/favourites", () => ({ setFavourite: jest.fn() }));

const base: Character = {
  id: 1,
  name: "Rick Sanchez",
  status: "Alive",
  species: "Human",
  origin: { name: "Earth (C-137)" },
  image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
};

describe("CharacterCard", () => {
  it("renders image and details", () => {
    render(<CharacterCard character={base} />);

    expect(
      screen.getByRole("img", { name: "Rick Sanchez" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Rick Sanchez")).toBeInTheDocument();
    expect(screen.getByText("Alive")).toBeInTheDocument();
    expect(screen.getByText("Human")).toBeInTheDocument();
    expect(screen.getByText("Earth (C-137)")).toBeInTheDocument();
  });

  it("shows green dot when alive", () => {
    render(<CharacterCard character={base} />);
    expect(screen.getByTestId("status-dot")).toHaveClass("bg-green-500");
  });

  it("shows red dot when dead", () => {
    render(<CharacterCard character={{ ...base, status: "Dead" }} />);
    expect(screen.getByTestId("status-dot")).toHaveClass("bg-red-500");
    expect(screen.getByText("Dead")).toBeInTheDocument();
  });

  it("hides the favourite button when signed out", () => {
    render(<CharacterCard character={base} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows the favourite button when signed in", () => {
    render(<CharacterCard character={base} favourited />);
    expect(
      screen.getByRole("button", { name: "Remove Rick Sanchez from favourites" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
