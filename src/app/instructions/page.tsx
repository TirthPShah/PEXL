"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileWithProgress } from "@/types/files";
import { PrintSettingsItem } from "@/types/printSettings";
import NavBar from "@/components/NavBar";
import { calculatePlatformCharges } from "@/lib/calculatePlatformCharges";

// Remove the PrintSettingsItem interface since we're importing it

interface SelectedShop {
  id: string;
  name: string;
  priceBW: number;
  priceColor: number;
  status: string;
  location: string;
  contact: string;
}

export default function InstructionsPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [settings, setSettings] = useState<{ description: string }>({
    description: "",
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedShop, setSelectedShop] = useState<SelectedShop | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [platformCharges, setPlatformCharges] = useState(0);

  useEffect(() => {
    const savedFiles = localStorage.getItem("printFiles");
    const savedShop = localStorage.getItem("selectedShop");
    const printSettingsArray: PrintSettingsItem[] = JSON.parse(
      localStorage.getItem("printSettingsArray") || "[]"
    );

    if (!savedFiles || !savedShop) {
      router.push("/");
      return;
    }

    const parsedFiles = JSON.parse(savedFiles);
    const shop = JSON.parse(savedShop);

    setFiles(parsedFiles);
    setSelectedShop(shop);

    // Calculate subtotal first
    const calculatedSubtotal = parsedFiles.reduce(
      (total: number, file: FileWithProgress) => {
        const fileSettings = printSettingsArray.find(
          (setting) =>
            setting.serverId === file.id || setting.tempId === file.id
        );

        if (!fileSettings) return total;

        const basePrice = fileSettings.isB_W ? shop.priceBW : shop.priceColor;
        const pageCount = fileSettings.pageCount || 1;
        const sheetsNeeded = fileSettings.isDoubleSided
          ? Math.ceil(pageCount / 2)
          : pageCount;

        return total + basePrice * sheetsNeeded;
      },
      0
    );

    // Calculate platform charges
    const charges = calculatePlatformCharges(calculatedSubtotal);

    setSubtotal(calculatedSubtotal);
    setPlatformCharges(charges);
    setTotalPrice(calculatedSubtotal + charges);
  }, [router]);

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setSettings((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  };

  const handleNextClick = () => {
    localStorage.setItem(
      "printSettingsArray",
      JSON.stringify([
        ...JSON.parse(localStorage.getItem("printSettingsArray") || "[]"),
        { description: settings.description },
      ])
    );
    router.push("/checkout");
  };

  const handlePrintSettingChange = (
    fileId: string,
    setting: keyof Pick<PrintSettingsItem, "isB_W" | "isDoubleSided">,
    value: boolean
  ) => {
    const settings: PrintSettingsItem[] = JSON.parse(
      localStorage.getItem("printSettingsArray") || "[]"
    );

    const updatedSettings = settings.map((item) => {
      if (item.serverId === fileId || item.tempId === fileId) {
        return { ...item, [setting]: value };
      }
      return item;
    });

    localStorage.setItem("printSettingsArray", JSON.stringify(updatedSettings));
    // Recalculate total price...
  };

  return (
    <>
      <NavBar />
      <main className="pt-25 px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-8">Print Instructions</h1>

          {selectedShop && (
            <div className="bg-white rounded-lg border p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Selected Shop</h2>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{selectedShop.name}</p>
                  <p className="text-sm text-gray-500">
                    {selectedShop.location}
                  </p>
                </div>
                <div className="text-sm">
                  <p>B&W: ₹{selectedShop.priceBW}/sheet</p>
                  <p>Color: ₹{selectedShop.priceColor}/sheet</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Files to Print</h2>
            <div className="space-y-4">
              {files.map((file) => {
                const printSettingsArray: PrintSettingsItem[] = JSON.parse(
                  localStorage.getItem("printSettingsArray") || "[]"
                );
                const fileSettings = printSettingsArray.find(
                  (setting) =>
                    setting.serverId === file.id || setting.tempId === file.id
                );

                if (!fileSettings) return null;

                const basePrice = fileSettings.isB_W
                  ? selectedShop?.priceBW || 0
                  : selectedShop?.priceColor || 0;
                const pageCount = fileSettings.pageCount || 1;

                // Calculate sheets based on single/double sided
                const sheetsNeeded = fileSettings.isDoubleSided
                  ? Math.ceil(pageCount / 2)
                  : pageCount;

                const filePrice = basePrice * sheetsNeeded;

                return (
                  <div
                    key={file.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="flex items-center gap-2">
                      {file.name}
                      <span className="text-gray-500">
                        ({fileSettings.isB_W ? "B&W" : "Color"}) •{" "}
                        {fileSettings.isDoubleSided
                          ? "Double-sided"
                          : "Single-sided"}{" "}
                        • {pageCount} pages • {sheetsNeeded} sheets
                      </span>
                    </span>
                    <span>₹{filePrice.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">
              Additional Instructions
            </h2>
            <textarea
              className="w-full h-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter any specific instructions for printing (e.g., double-sided, paper quality preferences, etc.)"
              value={settings.description}
              onChange={handleDescriptionChange}
            />
          </div>

          <div className="bg-white rounded-lg border p-6 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-lg">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Platform Charges:</span>
                <span>₹{platformCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t">
                <span>Total Price:</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mb-8">
            <button
              onClick={() => router.push("/stationary")}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNextClick}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Checkout
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
