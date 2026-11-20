import { auth } from "@/lib/auth";
import { mongoClient } from "@/lib/mongodb";

const TEST_USER = {
  name: "Test User",
  email: "user1@test.com",
  // Local development only.
  password: "password1234",
};

async function main() {
  const ctx = await auth.$context;

  if (await ctx.internalAdapter.findUserByEmail(TEST_USER.email)) {
    console.log(`User ${TEST_USER.email} already exists`);
    return;
  }

  const hash = await ctx.password.hash(TEST_USER.password);
  const user = await ctx.internalAdapter.createUser(
    {
      email: TEST_USER.email,
      name: TEST_USER.name,
      emailVerified: true,
    },
    { method: "email-password" },
  );
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: hash,
  });

  console.log(`Created user ${TEST_USER.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoClient.close());
