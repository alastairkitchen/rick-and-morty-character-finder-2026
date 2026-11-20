import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { SignUpForm } from "./SignUpForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/session";

async function SignUpContent() {
  if (await getSession()) redirect("/");
  return <SignUpForm />;
}

export default function SignUpPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>
            Sign up with your name, email and password. We&apos;ll email you a
            link to verify your account.
          </CardDescription>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Sign in here
            </Link>
          </p>
        </CardHeader>
        <CardContent>
          <Suspense>
            <SignUpContent />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
