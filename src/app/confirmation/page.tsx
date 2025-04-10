"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

interface FileDescription {
  name: string;
  isBlackAndWhite: boolean;
  isDoubleSided: boolean;
  pageCount: number;
  size: string;
}

interface OrderSummary {
  subtotal: number;
  platformFee: number;
  totalPrice: number;
  fileCount: number;
  shopName: string;
  orderId: string;
  filesDescription: FileDescription[];
  paymentMethod?: "cash" | "card";
}

export default function ConfirmationPage() {
  const [subtotal, setSubtotal] = useState(0);
  const [platformFee, setPlatformFee] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [shopName, setShopName] = useState("");
  const [orderId, setOrderId] = useState("");
  const [filesDescription, setFilesDescription] = useState<FileDescription[]>(
    []
  );
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "">("");
  const [orderSummary, setOrderSummary] = useState(false);

  useEffect(() => {
    // Ensure we're in the browser environment before accessing localStorage
    if (typeof window !== "undefined") {
      try {
        // Try to retrieve the order summary directly as a single object
        const orderSummaryData = localStorage.getItem("orderSummary");

        if (orderSummaryData) {
          // If it exists as a single object, parse and set all values
          const orderData = JSON.parse(orderSummaryData) as OrderSummary;
          setSubtotal(orderData.subtotal || 0);
          setPlatformFee(orderData.platformFee || 0);
          setTotalPrice(orderData.totalPrice);
          setFileCount(orderData.fileCount);
          setShopName(orderData.shopName);
          setOrderId(orderData.orderId);
          setFilesDescription(orderData.filesDescription || []);
          setPaymentMethod(orderData.paymentMethod || "cash");
          setOrderSummary(true);
        } else {
          // Fallback to individual items in localStorage
          setTotalPrice(
            localStorage.getItem("totalPrice")
              ? parseFloat(localStorage.getItem("totalPrice")!)
              : 0
          );
          setFileCount(
            localStorage.getItem("fileCount")
              ? parseInt(localStorage.getItem("fileCount")!)
              : 0
          );
          setShopName(localStorage.getItem("shopName") || "");
          setOrderId(localStorage.getItem("orderId") || "");
          setFilesDescription(
            localStorage.getItem("files")
              ? JSON.parse(localStorage.getItem("files")!)
              : []
          );
          setOrderSummary(true);
        }

        console.log("Order Summary loaded from localStorage");
      } catch (error) {
        console.error("Error retrieving order data from localStorage:", error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto">
        {/* Smaller Lottie animation */}
        <div className="flex justify-center mb-4">
          <div className="w-48 h-48">
            <DotLottieReact src="/confirmation.lottie" autoplay loop />
          </div>
        </div>

        {/* Order confirmation card */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-center mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-500 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">
              Order Confirmed!
            </h1>
          </div>

          {orderSummary ? (
            <div className="space-y-4">
              <div className="border-t border-b border-gray-100 py-4">
                <h2 className="text-lg font-medium text-gray-800 mb-3">
                  Order Summary
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">#{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Print Shop:</span>
                    <span className="font-medium">{shopName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Files:</span>
                    <span className="font-medium">
                      {fileCount} {fileCount === 1 ? "file" : "files"}
                    </span>
                  </div>

                  {/* File details sublist */}
                  {filesDescription && filesDescription.length > 0 && (
                    <div className="mt-2 ml-4 border-l-2 border-gray-200 pl-3">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        File Details:
                      </h3>
                      <ul className="space-y-3">
                        {filesDescription.map((file, index) => (
                          <li
                            key={index}
                            className="text-sm bg-gray-50 p-2 rounded"
                          >
                            <div className="font-medium text-gray-800">
                              {file.name}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              <div className="flex justify-between">
                                <span>Size:</span>
                                <span>{file.size}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Pages:</span>
                                <span>{file.pageCount}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Print Mode:</span>
                                <span>
                                  {file.isBlackAndWhite
                                    ? "Black & White"
                                    : "Color"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Sided:</span>
                                <span>
                                  {file.isDoubleSided
                                    ? "Double-sided"
                                    : "Single-sided"}
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Platform charges:</span>
                    <span>₹{platformFee.toFixed(2)}</span>
                    {platformFee > 5 && (
                      <span className="text-xs text-gray-500 ml-2">
                        (Minimum order fee)
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between text-lg font-semibold mt-2 pt-2 border-t border-gray-100">
                    <span>Total:</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-b border-gray-100 py-4">
                <h2 className="text-lg font-medium text-gray-800 mb-3">
                  Payment Details
                </h2>
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium mr-2">Method:</span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                    {paymentMethod === "card"
                      ? "Card Payment"
                      : "Cash on Delivery"}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-center">
                Your order has been placed successfully. Visit the print shop to
                collect your prints.
                {paymentMethod === "cash" &&
                  " Please pay at the shop when you collect your order."}
              </p>

              <div className="flex justify-center mt-6">
                <Link
                  href="/"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-600">
              Order details not available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
