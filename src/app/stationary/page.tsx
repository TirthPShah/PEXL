"use client";

import { useShops } from "@/lib/hooks/useShops";
import StatusCard from "@/components/StatusCard";
import NavBar from "@/components/NavBar";
import { useRouter } from "next/navigation";

export default function StationaryPage() {
  const { shops, loading, error } = useShops();
  const router = useRouter();

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="container mt-25 mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6">
            Available Stationery Shops
          </h1>
          <div className="flex justify-center items-center h-64">
            <p>Loading shops...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <div className="container mt-25 mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6">
            Available Stationery Shops
          </h1>
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            Error: {error}
          </div>
        </div>
      </>
    );
  }

  const handleShopSelect = (shopId: string) => {
    // Save selected shop to local storage
    localStorage.setItem("selectedShop", shopId);
    // Navigate to checkout
    router.push("/checkout");
  };

  return (
    <>
      <NavBar />
      <div className="container mt-25 mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Available Stationery Shops</h1>

        <div className="w-full space-y-4">
          {shops.map((shop) => (
            <div
              key={shop._id?.toString()}
              onClick={() => handleShopSelect(shop._id?.toString() || "")}
              className="w-full"
            >
              <StatusCard
                name={shop.name}
                status={shop.status === "online" ? "Online" : "Offline"}
                bwPrice={shop.priceBW}
                colorPrice={shop.priceColor}
                pages={0} // You might want to fetch the queue size from another API
              />
            </div>
          ))}
        </div>

        {shops.length === 0 && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500">
              No shops available at the moment.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
