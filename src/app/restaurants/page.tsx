import RestaurantList from "@/components/RestaurantList";

export default function Restaurants() {
  return (
    <main className="container mx-auto p-4">
      <RestaurantList endpoint="/api/restaurants" title="All Restaurants" />
    </main>
  );
}
