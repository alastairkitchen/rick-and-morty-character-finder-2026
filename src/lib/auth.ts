import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/mongodb";
import { sendVerificationEmail } from "@/lib/verification-email";

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    // Duplicate sign-ups get a generic success response, so emails can't be enumerated.
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Not awaited so response time doesn't reveal whether the email exists.
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
