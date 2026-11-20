import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/mongodb/mongodb";
import { sendVerificationEmail } from "./verification-email";

// In development, skip email verification and sign users in on sign up.
export const isDevelopmentEnvironment =
  process.env.ENVIRONMENT === "development";

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: !isDevelopmentEnvironment,
    autoSignIn: isDevelopmentEnvironment,
  },
  emailVerification: isDevelopmentEnvironment
    ? undefined
    : {
        sendOnSignUp: true,
        sendOnSignIn: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
          void sendVerificationEmail({
            email: user.email,
            name: user.name,
            url,
          }).catch((error) => {
            console.error("Failed to send verification email", error);
          });
        },
      },
  // Must be the last plugin.
  plugins: [nextCookies()],
});
