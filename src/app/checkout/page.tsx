"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileWithProgress } from "@/types/files";
import NavBar from "@/components/NavBar";

interface PrintSettings {
  description: string;
  [key: string]: any;
}

interface SelectedShop {
  id: string;
  name: string;
  priceBW: number;
  priceColor: number;
  status: string;
  location: string;
  contact: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [printSettings, setPrintSettings] = useState<PrintSettings | null>(
    null
  );
  const [selectedShop, setSelectedShop] = useState<SelectedShop | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Retrieve all necessary information from localStorage
    const savedFiles = localStorage.getItem("printFiles");
    const savedSettings = localStorage.getItem("printSettings");
    const savedShop = localStorage.getItem("selectedShop");

    // Validate required data is present
    if (!savedFiles) {
      router.push("/");
      return;
    }

    if (!savedShop) {
      router.push("/stationary");
      return;
    }

    if (!savedSettings) {
      router.push("/instructions");
      return;
    }

    const parsedFiles = JSON.parse(savedFiles);
    const settings = JSON.parse(savedSettings);
    const shop = JSON.parse(savedShop);

    setFiles(parsedFiles);
    setPrintSettings(settings);
    setSelectedShop(shop);

    // Calculate final price with the updated sheet calculation logic
    const price = parsedFiles.reduce(
      (total: number, file: FileWithProgress) => {
        const fileSettings = settings[file.id] || {};
        const basePrice = fileSettings.isBlackAndWhite
          ? shop.priceBW
          : shop.priceColor;
        const pageCount = file.pageCount || 1;

        // Calculate sheets based on whether it's single or double sided
        const sheetsNeeded = fileSettings.isDoubleSided
          ? Math.ceil(pageCount / 2)
          : pageCount;

        return total + basePrice * sheetsNeeded;
      },
      0
    );

    setTotalPrice(price);
  }, [router]);

  const handleSubmitOrder = async () => {
    if (!selectedShop) return;

    setLoading(true);
    setError("");

    try {
      // Prepare order data
      const orderData = {
        shop: {
          id: selectedShop.id,
          name: selectedShop.name,
        },
        files: files.map((file) => ({
          name: file.name,
          id: file.id,
          pageCount: file.pageCount,
          isBlackAndWhite:
            printSettings && printSettings[file.id]
              ? printSettings[file.id].isBlackAndWhite
              : false,
          isDoubleSided:
            printSettings && printSettings[file.id]
              ? printSettings[file.id].isDoubleSided
              : true,
        })),
        instructions: printSettings?.description || "",
        totalPrice: totalPrice,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // Submit order to API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit order");
      }

      // Order successful - redirect to confirmation page
      const result = await response.json();
      router.push(`/confirmation?orderId=${result.orderId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!selectedShop || !printSettings) {
    return (
      <>
        <NavBar />
        <div className="pt-25 px-8">
          <div className="max-w-3xl mx-auto text-center py-12">
            <p>Loading checkout information...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="pt-25 px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-8">Checkout</h1>

          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>

            <div className="mb-4 pb-4 border-b">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Selected Shop
              </h3>
              <div className="flex justify-between">
                <p className="font-medium">{selectedShop.name}</p>
                <p className="text-sm text-gray-500">{selectedShop.location}</p>
              </div>
            </div>

            <div className="mb-4 pb-4 border-b">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Files</h3>
              <div className="space-y-2">
                {files.map((file) => {
                  const fileSettings = printSettings[file.id] || {};
                  const basePrice = fileSettings.isBlackAndWhite
                    ? selectedShop.priceBW
                    : selectedShop.priceColor;
                  const pageCount = file.pageCount || 1;

                  // Calculate sheets based on single/double sided
                  const sheetsNeeded = fileSettings.isDoubleSided
                    ? Math.ceil(pageCount / 2)
                    : pageCount;

                  const filePrice = basePrice * sheetsNeeded;

                  return (
                    <div key={file.id} className="flex justify-between text-sm">
                      <div>
                        <p>{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {fileSettings.isBlackAndWhite ? "B&W" : "Color"} •
                          {fileSettings.isDoubleSided
                            ? " Double-sided"
                            : " Single-sided"}{" "}
                          •{pageCount} pages • {sheetsNeeded} sheets
                        </p>
                      </div>
                      <p>₹{filePrice.toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {printSettings.description && (
              <div className="mb-4 pb-4 border-b">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Instructions
                </h3>
                <p className="text-sm">{printSettings.description}</p>
              </div>
            )}

            <div className="flex justify-between items-center text-lg font-semibold mt-4">
              <span>Total:</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4 mb-8">
            <button
              onClick={() => router.push("/instructions")}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Back
            </button>
            <button
              onClick={handleSubmitOrder}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
