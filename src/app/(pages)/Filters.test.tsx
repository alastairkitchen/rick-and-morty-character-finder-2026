import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Filters, SEARCH_DEBOUNCE_MS } from "./Filters";

const mockReplace = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const setup = (query = "") => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  render(<Filters query={query} />);
  return { user, input: screen.getByRole("searchbox") };
};

const wait = (ms: number) => act(() => jest.advanceTimersByTime(ms));

describe("Filters", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockReplace.mockReset();
  });

  afterEach(() => jest.useRealTimers());

  it("does not search while the user is typing", async () => {
    const { user, input } = setup();

    await user.type(input, "rick");
    wait(SEARCH_DEBOUNCE_MS - 1);

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("searches once after typing stops", async () => {
    const { user, input } = setup();

    await user.type(input, "rick");
    wait(SEARCH_DEBOUNCE_MS);

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/?q=rick", { scroll: false });
  });

  it("restarts the wait on each key press", async () => {
    const { user, input } = setup();

    await user.type(input, "ri");
    wait(SEARCH_DEBOUNCE_MS - 100);
    await user.type(input, "ck");
    wait(SEARCH_DEBOUNCE_MS - 100);
    expect(mockReplace).not.toHaveBeenCalled();

    wait(100);
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/?q=rick", { scroll: false });
  });

  it("returns to all characters on page 1 when text is cleared", async () => {
    const { user, input } = setup("rick");

    await user.clear(input);
    wait(SEARCH_DEBOUNCE_MS);

    expect(mockReplace).toHaveBeenCalledWith("/", { scroll: false });
  });

  it("does not search when the query is unchanged", async () => {
    const { user, input } = setup("rick");

    await user.type(input, "  ");
    wait(SEARCH_DEBOUNCE_MS);

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
