"use client";

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

interface PaymentFormProps {
  totalAmount: number;
  onPaymentSuccess: () => void;
}

export default function PaymentForm({
  totalAmount,
  onPaymentSuccess,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet. Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsProcessing(true);
    setPaymentError("");

    try {
      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/confirmation`,
        },
        redirect: "if_required",
      });

      if (error) {
        // Show error to your customer
        setPaymentError(error.message || "An error occurred during payment");
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment successful
        setIsProcessing(false);
        onPaymentSuccess();
      } else {
        // Other unexpected state
        setPaymentError("Something went wrong with your payment");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setPaymentError("An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-6">
        <PaymentElement />
      </div>

      {paymentError && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {paymentError}
        </div>
      )}

      <div className="text-sm text-gray-600 mb-4">
        <p>You will be charged ₹{totalAmount.toFixed(2)}</p>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          `Pay ₹${totalAmount.toFixed(2)}`
        )}
      </button>
    </form>
  );
}
