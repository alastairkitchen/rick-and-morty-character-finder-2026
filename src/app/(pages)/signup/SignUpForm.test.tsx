import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { signUp } from "@/actions/auth";
import { SignUpForm } from "./SignUpForm";

jest.mock("@/actions/auth", () => ({ signUp: jest.fn() }));

const mockSignUp = signUp as jest.Mock;

async function fillForm() {
  await userEvent.type(screen.getByLabelText("Name"), "Morty Smith");
  await userEvent.type(screen.getByLabelText("Email"), "new@test.com");
  await userEvent.type(screen.getByLabelText("Password"), "secret-pass");
  await userEvent.click(screen.getByRole("button", { name: "Sign up" }));
}

describe("SignUpForm", () => {
  beforeEach(() => mockSignUp.mockReset());

  it("renders name, email and password fields", () => {
    render(<SignUpForm />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute(
      "type",
      "password",
    );
    expect(screen.getByRole("button", { name: "Sign up" })).toBeInTheDocument();
  });

  it("submits entered details to the action", async () => {
    mockSignUp.mockResolvedValue({});
    render(<SignUpForm />);

    await fillForm();

    expect(mockSignUp).toHaveBeenCalledTimes(1);
    const formData = mockSignUp.mock.calls[0][1] as FormData;
    expect(formData.get("name")).toBe("Morty Smith");
    expect(formData.get("email")).toBe("new@test.com");
    expect(formData.get("password")).toBe("secret-pass");
  });

  it("shows error returned by the action", async () => {
    mockSignUp.mockResolvedValue({
      error: "Password must be at least 8 characters.",
    });
    render(<SignUpForm />);

    await fillForm();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Password must be at least 8 characters.",
    );
  });
});
