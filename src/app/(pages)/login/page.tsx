import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/app/features/auth/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/app/features/auth/session";

const LoginContent = async ({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"];
}) => {
  if (await getSession()) redirect("/");
  const { verify } = await searchParams;

  return (
    <div className="space-y-4">
      {verify === "sent" && (
        <p
          role="status"
          className="rounded-md border bg-muted px-3 py-2 text-sm"
        >
          Check your email for a verification link to finish signing up.
        </p>
      )}
      <LoginForm />
    </div>
  );
};

const LoginPage = ({ searchParams }: PageProps<"/login">) => {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription>
            Use your email and password to continue.
          </CardDescription>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Sign up here
            </Link>
          </p>
        </CardHeader>
        <CardContent>
          <Suspense>
            <LoginContent searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
