import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { signIn } from "./actions";
import { LoginForm } from "./LoginForm";

jest.mock("./actions", () => ({ signIn: jest.fn() }));

const mockSignIn = signIn as jest.Mock;

describe("LoginForm", () => {
  beforeEach(() => mockSignIn.mockReset());

  it("renders email and password fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });

  it("submits entered credentials to the action", async () => {
    mockSignIn.mockResolvedValue({});
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("Email"), "user1@test.com");
    await userEvent.type(screen.getByLabelText("Password"), "secret-pass");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(mockSignIn).toHaveBeenCalledTimes(1);
    const formData = mockSignIn.mock.calls[0][1] as FormData;
    expect(formData.get("email")).toBe("user1@test.com");
    expect(formData.get("password")).toBe("secret-pass");
  });

  it("shows error returned by the action", async () => {
    mockSignIn.mockResolvedValue({ error: "Invalid email or password." });
    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("Email"), "user1@test.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrong");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password.",
    );
  });
});
