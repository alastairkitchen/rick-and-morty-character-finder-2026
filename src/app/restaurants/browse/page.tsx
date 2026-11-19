import RestaurantList from "@/components/RestaurantList";

export default function BrowseRestaurants() {
  return (
    <main className="container mx-auto p-4">
      <RestaurantList
        endpoint="/api/restaurants/browse"
        title='Filtered Restaurants (Queens, containing "Moon")'
      />
    </main>
  );
}
