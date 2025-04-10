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
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.log("Stripe.js hasn't loaded yet");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      // For the purpose of this implementation, we'll simulate successful payment
      // and call onPaymentSuccess directly instead of redirecting.
      // In a real implementation, Stripe would redirect to the return_url.
      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          redirect: "if_required", // Change from 'always' to 'if_required'
        });

      if (confirmError) {
        throw confirmError;
      }

      // If we get here, the payment was successful
      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Call the onPaymentSuccess callback to handle order creation and redirect
        onPaymentSuccess();
      } else {
        // Let Stripe handle any redirects as needed
        console.log("Payment requires additional steps");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.message || "An error occurred during payment");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-6">
        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="text-sm text-gray-600 mb-4">
        <p>You will be charged ₹{totalAmount.toFixed(2)}</p>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {processing ? (
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
