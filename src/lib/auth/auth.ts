import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/lib/mongodb/mongodb";
import { sendVerificationEmail } from "@/lib/email-client/verification-email";

export const auth = betterAuth({
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
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
