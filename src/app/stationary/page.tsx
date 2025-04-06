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
    // Find the selected shop
    const selectedShop = shops.find((shop) => shop._id?.toString() === shopId);

    if (selectedShop) {
      // Save complete shop details to localStorage
      localStorage.setItem(
        "selectedShop",
        JSON.stringify({
          id: selectedShop._id?.toString(),
          name: selectedShop.name,
          priceBW: selectedShop.priceBW,
          priceColor: selectedShop.priceColor,
          status: selectedShop.status,
          location: selectedShop.location,
          contact: selectedShop.contact,
        })
      );
    }

    // Navigate to instructions
    router.push("/instructions");
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
                location={shop.location}
                pages={0}
              />
            </div>
          ))}
        </div>

        {shops.length === 0 && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-500">No shops available at the moment.</p>
          </div>
        )}
      </div>
    </>
  );
}
