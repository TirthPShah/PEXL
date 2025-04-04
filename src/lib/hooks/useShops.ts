import { useState, useEffect } from "react";
import { StationeryShop } from "@/types/stationery";

export function useShops() {
  const [shops, setShops] = useState<StationeryShop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchShops() {
      try {
        const response = await fetch("/api/shops");

        if (!response.ok) {
          throw new Error("Failed to fetch shops");
        }

        const data = await response.json();
        setShops(data.shops);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchShops();
  }, []);

  return { shops, loading, error };
}
