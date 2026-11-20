import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ModeToggle } from "./ModeToggle";

const mockSetTheme = jest.fn();

jest.mock("next-themes", () => ({
  useTheme: () => ({ setTheme: mockSetTheme }),
}));

describe("ModeToggle", () => {
  beforeEach(() => mockSetTheme.mockReset());

  it.each([
    ["Light", "light"],
    ["Dark", "dark"],
    ["System", "system"],
  ])("selecting %s sets theme %s", async (label, theme) => {
    render(<ModeToggle />);

    await userEvent.click(screen.getByRole("button", { name: "Toggle theme" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: label }));

    expect(mockSetTheme).toHaveBeenCalledWith(theme);
  });
});
