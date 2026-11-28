"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth, isDevelopmentEnvironment } from "./auth";
import type { AuthFormState } from "./types";

export async function signIn(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return { error: "Enter your email and password." };
  }

  try {
    await auth.api.signInEmail({
      body: { email: email.trim(), password },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      // Better Auth only reports this after the password matches.
      if (error.body?.code === "EMAIL_NOT_VERIFIED") {
        return {
          error:
            "Verify your email before signing in. We sent you a new verification link.",
        };
      }
      // Same message for unknown email and wrong password.
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  redirect("/");
}

export async function signUp(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !password
  ) {
    return { error: "Enter your name, email and password." };
  }

  try {
    // Outside development, existing emails also return success; no session is created until verification.
    await auth.api.signUpEmail({
      body: {
        name: name.trim(),
        email: email.trim(),
        password,
        callbackURL: "/",
      },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      switch (error.body?.code) {
        case "INVALID_EMAIL":
          return { error: "Enter a valid email address." };
        case "PASSWORD_TOO_SHORT":
          return { error: "Password must be at least 8 characters." };
        case "PASSWORD_TOO_LONG":
          return { error: "Password is too long." };
        case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
          return { error: "Email already in use please use another email." };
        default:
          return { error: "Could not create your account. Please try again." };
      }
    }
    throw error;
  }

  // Development sign up creates a session directly.
  redirect(isDevelopmentEnvironment ? "/" : "/login?verify=sent");
}

export async function signOut(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
