"use client";

import { useEffect, useState } from "react";

interface Restaurant {
  _id: string;
  name: string;
  borough: string;
  cuisine: string;
}

function RestaurantRow({ restaurant }: { restaurant: Restaurant }) {
  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className="p-4 align-middle">{restaurant.name}</td>
      <td className="p-4 align-middle">{restaurant.borough}</td>
      <td className="p-4 align-middle">{restaurant.cuisine}</td>
    </tr>
  );
}

interface RestaurantListProps {
  endpoint: string;
  title: string;
}

export default function RestaurantList({
  endpoint,
  title,
}: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getRestaurants() {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          console.error(`An error occurred: ${response.statusText}`);
          return;
        }
        setRestaurants(await response.json());
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    }

    getRestaurants();
  }, [endpoint]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <>
      <h3 className="p-4 text-lg font-semibold">{title}</h3>
      <div className="overflow-hidden rounded-lg border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Borough
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Cuisine
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {restaurants.map((restaurant) => (
                <RestaurantRow key={restaurant._id} restaurant={restaurant} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
