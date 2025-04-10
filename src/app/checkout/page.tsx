"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FileWithProgress } from "@/types/files";
import { PrintSettingsItem } from "@/types/printSettings";
import NavBar from "@/components/NavBar";
import PaymentForm from "@/components/PaymentForm";
import { calculatePlatformCharges } from "@/lib/calculatePlatformCharges";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

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

interface FileDescription {
  name: string;
  isBlackAndWhite: boolean;
  isDoubleSided: boolean;
  pageCount: number;
  size: string;
}

interface ItemDescription {
  description: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [selectedShop, setSelectedShop] = useState<SelectedShop | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  // const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [platformCharges, setPlatformCharges] = useState(0);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const initialize = async () => {
      try {
        // Load saved data
        const savedFiles = localStorage.getItem("printFiles");
        const savedShop = localStorage.getItem("selectedShop");
        const printSettingsArray = JSON.parse(
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
              (setting: PrintSettingsItem) =>
                setting.serverId === file.id || setting.tempId === file.id
            );

            if (!fileSettings) return total;

            const basePrice = fileSettings.isB_W
              ? shop.priceBW
              : shop.priceColor;
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
        const totalAmount = calculatedSubtotal + charges;

        setSubtotal(calculatedSubtotal);
        setPlatformCharges(charges);
        setTotalPrice(totalAmount);

        // Generate random order ID (in production, this would come from your backend)
        const randomOrderId = Math.random().toString(36).substring(2, 10);
        setOrderId(randomOrderId);

        // IMPORTANT: Save order summary to localStorage BEFORE payment processing
        // Create file descriptions for the receipt
        const filesDescription: FileDescription[] = parsedFiles.map(
          (file: FileWithProgress) => {
            const fileSettings = printSettingsArray.find(
              (setting: PrintSettingsItem) =>
                setting.serverId === file.id || setting.tempId === file.id
            ) || { isB_W: false, isDoubleSided: true, pageCount: 1 };

            // Convert file size to readable format
            const formatFileSize = (bytes: number): string => {
              if (!bytes || bytes === 0) return "0 Bytes";
              const k = 1024;
              const sizes = ["Bytes", "KB", "MB", "GB"];
              const i = Math.floor(Math.log(bytes) / Math.log(k));
              return (
                parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
              );
            };

            return {
              name: file.name,
              isBlackAndWhite: fileSettings.isB_W,
              isDoubleSided: fileSettings.isDoubleSided,
              pageCount: fileSettings.pageCount || 1,
              size: formatFileSize(file.size),
            };
          }
        );

        // Create and save the order summary
        const orderSummary = {
          subtotal: calculatedSubtotal,
          platformFee: charges,
          totalPrice: totalAmount,
          fileCount: parsedFiles.length,
          shopName: shop.name,
          orderId: randomOrderId,
          filesDescription: filesDescription,
          paymentMethod: "card", // Since this is the Stripe checkout
        };

        // Save the complete order summary to localStorage
        localStorage.setItem("orderSummary", JSON.stringify(orderSummary));

        // Create payment intent with total amount including platform charges
        console.log("Creating payment intent for amount:", totalAmount);
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalAmount }),
        });

        if (!response.ok) {
          throw new Error(
            `Payment intent creation failed: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Payment intent created:", data);

        if (!data.clientSecret) {
          throw new Error("No client secret received");
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error("Checkout initialization error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        // setLoading(false);
      }
    };

    initialize();
  }, [router]);

  const handlePaymentSuccess = async () => {
    try {
      // Create order in the database
      const printSettingsArray = JSON.parse(
        localStorage.getItem("printSettingsArray") || "[]"
      );

      // Find the description if it exists
      const descriptionItem = printSettingsArray.find(
        (item: ItemDescription) => item.description
      );
      const description = descriptionItem?.description || "";

      // Prepare order data
      const ownerMail = selectedShop?.ownerMail ? selectedShop.ownerMail : "N/A";

      const orderData = {
        orderId: orderId,
        shop: selectedShop,
        ownerMail: ownerMail,
        files: files.map((file) => {
          const fileSettings = printSettingsArray.find(
        (setting: PrintSettingsItem) =>
          setting.serverId === file.id || setting.tempId === file.id
          ) || { isB_W: false, isDoubleSided: true };

          return {
        id: file.serverId || file.id,
        name: file.name,
        pageCount: file.pageCount || 1,
        isBlackAndWhite: fileSettings.isB_W,
        isDoubleSided: fileSettings.isDoubleSided,
          };
        }),
        subtotal: subtotal,
        platformFee: platformCharges,
        totalPrice: totalPrice,
        instructions: description,
        paymentMethod: "card",
        status: "active",
      };

      // Send order to API
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        console.error("Failed to create order:", await response.text());
      } else {
        const result = await response.json();
        // Update orderId with the one from the database
        if (result.orderId) {
          // Update the order summary with the real order ID
          const orderSummary = JSON.parse(
            localStorage.getItem("orderSummary") || "{}"
          );
          orderSummary.orderId = result.orderId;
          localStorage.setItem("orderSummary", JSON.stringify(orderSummary));
        }
      }

      // Redirect to confirmation page
      router.push("/confirmation");
    } catch (error) {
      console.error("Error creating order:", error);
      // Still redirect to confirmation page, but log the error
      router.push("/confirmation");
    }
  };

  if (error) {
    return (
      <>
        <NavBar />
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mt-4 mx-auto max-w-3xl">
          <p className="text-red-600">Error: {error}</p>
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

          {selectedShop && (
            <div className="bg-white rounded-lg border p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Platform Charges:</span>
                  <span>₹{platformCharges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-medium pt-2 border-t">
                  <span>Total Amount:</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-4">Payment Details</h2>
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  totalAmount={totalPrice}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </Elements>
            ) : (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2">Loading payment form...</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
