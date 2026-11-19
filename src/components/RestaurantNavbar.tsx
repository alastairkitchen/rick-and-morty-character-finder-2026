import Link from "next/link";

export default function RestaurantNavbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/restaurants" className="text-xl font-bold text-white">
          MongoDB Restaurants
        </Link>
        <div className="space-x-4">
          <Link
            href="/restaurants"
            className="text-gray-300 transition-colors hover:text-white"
          >
            All Restaurants
          </Link>
          <Link
            href="/restaurants/browse"
            className="text-gray-300 transition-colors hover:text-white"
          >
            Filtered Restaurants
          </Link>
        </div>
      </div>
    </nav>
  );
}
