import type { Metadata } from "next";

import RestaurantNavbar from "@/components/RestaurantNavbar";

export const metadata: Metadata = {
  title: "MongoDB Restaurants",
  description: "A Next.js application with MongoDB integration",
};

export default function RestaurantsLayout({
  children,
}: LayoutProps<"/restaurants">) {
  return (
    <>
      <RestaurantNavbar />
      {children}
    </>
  );
}
