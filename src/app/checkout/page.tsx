"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileWithProgress } from "@/types/files";

interface PrintSettings {
  description: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [settings, setSettings] = useState<PrintSettings>({
    description: "",
  });
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    // Retrieve files and their settings from localStorage
    const savedFiles = localStorage.getItem("printFiles");
    const savedSettings = localStorage.getItem("printSettings");

    if (!savedFiles) {
      router.push("/");
      return;
    }

    const files = JSON.parse(savedFiles);
    const printSettings = savedSettings ? JSON.parse(savedSettings) : {};

    setFiles(files);

    // Calculate price based on individual file settings and pages
    const price = files.reduce((total : number, file : FileWithProgress) => {
      const fileSettings = printSettings[file.id] || {};
      const basePrice = fileSettings.isBlackAndWhite ? 2 : 5; // B&W: &#8377;2, Color: &#8377;5
      const pageCount = file.pageCount || 1; // Default to 1 if not set
      const sheetsNeeded = Math.ceil(pageCount / 2); // Each sheet can hold 2 pages
      return total + basePrice * sheetsNeeded;
    }, 0);

    setTotalPrice(price);
  }, [router]);

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setSettings((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  };

  return (
    <main className="pt-25 px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-8">Checkout</h1>

        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Print Settings</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Printing Instructions
            </label>
            <textarea
              className="w-full h-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter any specific instructions for printing (e.g., double-sided, paper quality preferences, etc.)"
              value={settings.description}
              onChange={handleDescriptionChange}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="text-lg font-medium mb-4">Order Summary</h2>
          <div className="space-y-4">
            {files.map((file) => {
              const printSettings = localStorage.getItem("printSettings");
              const settings = printSettings ? JSON.parse(printSettings) : {};
              const fileSettings = settings[file.id] || {};
              const basePrice = fileSettings.isBlackAndWhite ? 2 : 5;
              const pageCount = file.pageCount || 1;
              const sheetsNeeded = Math.ceil(pageCount / 2);
              const filePrice = basePrice * sheetsNeeded;

              return (
                <div
                  key={file.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="flex items-center gap-2">
                    {file.name}
                    <span className="text-gray-500">
                      ({fileSettings.isBlackAndWhite ? "B&W" : "Color"}) •{" "}
                      {pageCount} pages
                    </span>
                  </span>
                  <span>&#8377;{filePrice.toFixed(2)}</span>
                </div>
              );
            })}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Price:</span>
                <span>&#8377;{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={() => {
              // Handle order submission
              console.log("Order submitted:", {
                files,
                settings,
                totalPrice,
                printSettings: localStorage.getItem("printSettings"),
              });
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Place Order
          </button>
        </div>
      </div>
    </main>
  );
}
