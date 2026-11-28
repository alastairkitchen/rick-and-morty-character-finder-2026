import { Heart, LogIn, LogOut, User } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { signOut } from "@/app/features/auth/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { ModeToggle } from "@/app/features/theme/ModeToggle";
import { getSession } from "@/app/features/auth/session";

const HeaderActions = async () => {
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
        href="/favourites"
        title="Favourites"
        aria-label="Favourites"
        className={buttonVariants({ variant: "ghost", size: "icon" })}
      >
        <Heart />
      </Link>
      <Link
        href="/account"
        title="Account"
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
};

export const Header = () => {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-semibold">
          Rick and Morty Finder
        </Link>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Suspense fallback={<div className="h-8 w-24" />}>
            <HeaderActions />
          </Suspense>
        </div>
      </div>
    </header>
  );
};
