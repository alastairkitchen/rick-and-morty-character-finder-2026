import { LogIn, LogOut, User } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { signOut } from "@/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/session";

async function HeaderActions() {
  const session = await getSession();

  if (!session) {
    return (
      <Link href="/login" className={buttonVariants({ variant: "outline" })}>
        <LogIn data-icon="inline-start" />
        Log in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/account"
        aria-label="Account"
        className={buttonVariants({ variant: "ghost", size: "icon" })}
      >
        <User />
      </Link>
      <form action={signOut}>
        <Button type="submit" variant="outline">
          <LogOut data-icon="inline-start" />
          Sign out
        </Button>
      </form>
    </div>
  );
}

export function Header() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-semibold">
          Rick and Morty Finder
        </Link>
        <Suspense fallback={<div className="h-8 w-24" />}>
          <HeaderActions />
        </Suspense>
      </div>
    </header>
  );
}
