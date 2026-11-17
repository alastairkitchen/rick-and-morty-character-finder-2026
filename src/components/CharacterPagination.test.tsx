import { render, screen } from "@testing-library/react";

import { CharacterPagination } from "@/components/CharacterPagination";

describe("CharacterPagination", () => {
  it("renders nothing for a single page", () => {
    const { container } = render(
      <CharacterPagination currentPage={1} totalPages={1} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("marks current page and links to others", () => {
    render(<CharacterPagination currentPage={2} totalPages={5} />);

    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "3" })).toHaveAttribute(
      "href",
      "/?page=3",
    );
    expect(screen.getByRole("link", { name: "1" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("hides previous on first page and next on last page", () => {
    const { rerender } = render(
      <CharacterPagination currentPage={1} totalPages={3} />,
    );
    expect(screen.queryByLabelText("Go to previous page")).toBeNull();
    expect(screen.getByLabelText("Go to next page")).toHaveAttribute(
      "href",
      "/?page=2",
    );

    rerender(<CharacterPagination currentPage={3} totalPages={3} />);
    expect(screen.queryByLabelText("Go to next page")).toBeNull();
    expect(screen.getByLabelText("Go to previous page")).toHaveAttribute(
      "href",
      "/?page=2",
    );
  });
});
