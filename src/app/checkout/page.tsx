"use client";

import { useState, useEffect } from "react";
import { StationeryShop } from "@/types/stationery";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
// Add additional imports as needed

export default function CheckoutPage() {
  const [shop, setShop] = useState<StationeryShop | null>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Load files from localStorage
    const storedFiles = localStorage.getItem("printFiles");
    if (storedFiles) {
      setFiles(JSON.parse(storedFiles));
    } else {
      router.push("/"); // Redirect if no files found
      return;
    }

    // Get selected shop ID
    const shopId = localStorage.getItem("selectedShop");
    if (!shopId) {
      router.push("/stationary"); // Redirect back to shop selection
      return;
    }

    // Fetch shop details
    async function fetchShopDetails() {
      try {
        const response = await fetch(`/api/shops/${shopId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch shop details");
        }
        const data = await response.json();
        setShop(data.shop);
        console.log(data)
      } catch (error) {
        console.error("Error fetching shop:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchShopDetails();
  }, [router]);

  // Calculate totals based on page counts
  const totalPages = files.reduce(
    (acc, file) => acc + (file.pageCount || 0),
    0
  );
  const bwTotal = totalPages * (shop?.priceBW || 0);
  const colorTotal = totalPages * (shop?.priceColor || 0);

  // Rest of the checkout page component...
}
