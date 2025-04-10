"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileWithProgress } from "@/types/files";
import NavBar from "@/components/NavBar";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "@/components/PaymentForm";

// Load Stripe outside of component to avoid recreating it on each render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

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
  ownerMail: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [printSettings, setPrintSettings] = useState<PrintSettings | null>(
    null
  );
  const [selectedShop, setSelectedShop] = useState<SelectedShop | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [platformFee, setPlatformFee] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState("");

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

    // Calculate subtotal
    const subtotal = parsedFiles.reduce(
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

    // Calculate platform fee based on the new logic
    const platformFee = subtotal < 50 ? 50 - subtotal : 5;

    // Add platform fee to calculate final price
    const finalPrice = subtotal + platformFee;

    setSubtotal(subtotal); // Store subtotal for display
    setPlatformFee(platformFee); // Store platform fee for display
    setTotalPrice(finalPrice);

    // Prepare order summary for localStorage
    const filesDescription = parsedFiles.map((file: FileWithProgress) => ({
      name: file.name,
      size: file.size,
      pageCount: file.pageCount || 1,
      isBlackAndWhite:
        settings && settings[file.id]
          ? settings[file.id].isBlackAndWhite
          : false,
      isDoubleSided:
        settings && settings[file.id] ? settings[file.id].isDoubleSided : true,
    }));

    // Store in localStorage for the confirmation page
    const orderSummaryForStorage = {
      subtotal: subtotal,
      platformFee: platformFee,
      totalPrice: finalPrice,
      fileCount: parsedFiles.length,
      shopName: shop.name,
      orderId: `ORDER-${Math.floor(Math.random() * 10000)}`, // Simple order ID generation
      filesDescription: filesDescription,
    };

    localStorage.setItem(
      "orderSummary",
      JSON.stringify(orderSummaryForStorage)
    );
  }, [router]);

  // Create payment intent when card payment is selected
  useEffect(() => {
    if (totalPrice > 0) {
      createPaymentIntent();
    }
  }, [totalPrice]);

  const createPaymentIntent = async () => {
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          currency: "inr",
          metadata: {
            order_id: `ORDER-${Math.floor(Math.random() * 10000)}`,
            shop_name: selectedShop?.name || "",
            file_count: files.length,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment");
      }

      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Payment initialization failed"
      );
      console.error("Error creating payment intent:", err);
    }
  };


  if (!selectedShop || !printSettings) {
    return (
      <>
        <NavBar />
        <div className="pt-25 px-8">
          <div className="max-w-3xl mx-auto text-center py-12">
            <p>{error || "Loading checkout information..."}</p>
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

            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Platform charges:</span>
              <span>₹{platformFee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-lg font-semibold mt-3 pt-2 border-t">
              <span>Total:</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Payment Method</h2>

            <div className="flex space-x-4 mb-6">
              <button
                className={`px-4 py-2 border rounded-lg flex items-center border-blue-500 bg-blue-50`}
              >
                <span className="mr-2">💳</span> Pay with Card
              </button>
            </div>

            {(
              <div className="mb-6">
                {clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <PaymentForm
                      totalAmount={totalPrice}
                      onPaymentSuccess={() => {
                        const orderSummary = {
                          subtotal: subtotal,
                          platformFee: platformFee,
                          totalPrice: totalPrice,
                          fileCount: files.length,
                          shopName: selectedShop?.name || "",
                          orderId: `ORDER-${Math.floor(Math.random() * 10000)}`,
                          filesDescription: files.map((file) => ({
                            name: file.name,
                            size: file.size,
                            pageCount: file.pageCount || 1,
                            isBlackAndWhite:
                              printSettings[file.id]?.isBlackAndWhite || false,
                            isDoubleSided:
                              printSettings[file.id]?.isDoubleSided || true,
                          })),
                          paymentMethod: "card",
                        };

                        localStorage.setItem(
                          "orderSummary",
                          JSON.stringify(orderSummary)
                        );
                        router.push("/confirmation");
                      }}
                    />
                  </Elements>
                ) : (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-2">Loading payment form...</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Back
              </button>

            </div>
          </div>
        </div>
      </main>
    </>
  );
}
