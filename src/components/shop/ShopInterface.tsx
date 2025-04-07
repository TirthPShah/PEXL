"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import {
  Printer,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
} from "lucide-react";
import { UserHeader } from "../dashboard/UserHeader";
import { toast } from "sonner";

interface File {
  name: string;
  id: string; // Changed from branded type to regular string for MongoDB ObjectId
  pageCount: number;
  isBlackAndWhite: boolean;
  isDoubleSided: boolean;
}

interface Shop {
  id: string;
  name: string;
  ownerMail: string;
}

interface Order {
  _id: string;
  shop: Shop;
  files: File[];
  instructions: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export default function ShopInterface() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [downloadingFiles, setDownloadingFiles] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    async function fetchOrders() {
      if (!session?.user?.email) return;

      try {
        const response = await fetch("/api/orders");
        const data = await response.json();

        if (data.activeOrders) {
          // Filter orders for the current shop owner
          const ownerOrders = data.activeOrders.filter(
            (order: Order) => order.shop.ownerMail === session.user!.email
          );
          setOrders(ownerOrders);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [session]);

  const toggleOrderExpansion = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      // Set the downloading state for this file
      setDownloadingFiles((prev) => ({ ...prev, [fileId]: true }));

      // Make an API request to get the file using MongoDB ObjectId
      console.log("Downloading file with MongoDB ID:", fileId);
      const response = await fetch(`/api/files/${fileId}`);

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      // Get the file as a blob
      const fileBlob = await response.blob();

      // Create a download link and trigger download
      const url = window.URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up the URL
      window.URL.revokeObjectURL(url);

      toast.success(`File ${fileName} downloaded successfully`);
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error(
        `Failed to download file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      // Reset downloading state
      setDownloadingFiles((prev) => ({ ...prev, [fileId]: false }));
    }
  };

  const markOrderAsComplete = async (orderId: string) => {
    // Implementation for marking order as complete
    // This would be connected to another API endpoint
    toast.info("Mark as complete functionality coming soon");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="px-8">
      <div className="max-w-7xl mx-auto">
        {/* Added UserHeader with owner role */}
        <UserHeader role="owner" />

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Active Orders
            </h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {orders.length} orders
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="flex justify-center mb-4">
                <Printer className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No active orders
              </h3>
              <p className="text-gray-500">
                New orders will appear here when customers place them.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-200"
                >
                  <div
                    className="p-6 cursor-pointer flex justify-between items-center"
                    onClick={() => toggleOrderExpansion(order._id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Order #{order._id.substring(order._id.length - 6)}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="font-medium text-gray-900">
                          ₹{order.totalPrice.toFixed(2)}
                        </span>
                        <div className="text-sm text-gray-500 mt-1">
                          {order.files.length}{" "}
                          {order.files.length === 1 ? "file" : "files"}
                        </div>
                      </div>
                      <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                        {order.status}
                      </div>
                      {expandedOrder === order._id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {expandedOrder === order._id && (
                    <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                      <h4 className="font-medium text-gray-700 mb-3">Files</h4>
                      <div className="space-y-3 mb-4">
                        {order.files.map((file) => (
                          <div
                            key={file.id}
                            className="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium text-gray-800 mb-1 truncate max-w-md">
                                {file.name}
                              </p>
                              <div className="flex items-center space-x-3 text-sm text-gray-600">
                                <span>
                                  {file.pageCount}{" "}
                                  {file.pageCount === 1 ? "page" : "pages"}
                                </span>
                                <span>•</span>
                                <span>
                                  {file.isBlackAndWhite
                                    ? "Black & White"
                                    : "Color"}
                                </span>
                                <span>•</span>
                                <span>
                                  {file.isDoubleSided
                                    ? "Double-sided"
                                    : "Single-sided"}
                                </span>
                              </div>
                            </div>
                            {/* Download button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadFile(file.id, file.name);
                              }}
                              disabled={downloadingFiles[file.id]}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                            >
                              {downloadingFiles[file.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                              <span>
                                {downloadingFiles[file.id]
                                  ? "Downloading..."
                                  : "Download"}
                              </span>
                            </button>
                          </div>
                        ))}
                      </div>

                      {order.instructions && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 mb-2">
                            Instructions
                          </h4>
                          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-sm text-gray-700">
                            {order.instructions}
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-3 mt-4">
                        <button
                          onClick={() => markOrderAsComplete(order._id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                        >
                          <CheckCircle className="h-5 w-5" />
                          <span>Mark as Complete</span>
                        </button>
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
                          <AlertCircle className="h-5 w-5" />
                          <span>Contact Customer</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
