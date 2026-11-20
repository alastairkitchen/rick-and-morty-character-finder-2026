import { redirect } from "next/navigation";
import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/app/features/auth/session";
import { getFavouriteIdCount } from "@/app/features/favourites/actions";

const AccountDetails = async () => {
  const session = await getSession();
  if (!session) redirect("/login");

  const favourites = await getFavouriteIdCount(session.user.id);

  const { name, email, createdAt } = session.user;

  return (
    <dl className="space-y-3 text-sm">
      <div>
        <dt className="text-muted-foreground">Name</dt>
        <dd>{name}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Email</dt>
        <dd>{email}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Member since</dt>
        <dd>
          {new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
            new Date(createdAt),
          )}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Favourited characters</dt>
        <dd>{favourites.length}</dd>
      </div>
    </dl>
  );
};

const AccountPage = () => {
  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Account</CardTitle>
          <CardDescription>Your account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-32 w-full" />}>
            <AccountDetails />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountPage;
