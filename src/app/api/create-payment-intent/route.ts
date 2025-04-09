import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json();

    // Extract payment details
    const { amount, subtotal, currency = "inr", metadata = {} } = body;

    // If both amount and subtotal are provided, use the amount (final calculated total)
    // Otherwise, recalculate using the platform fee logic
    let finalAmount = amount;

    if (!finalAmount && subtotal) {
      // Calculate platform fee based on the new logic
      const platformFee = subtotal < 50 ? 50 - subtotal : 5;
      finalAmount = subtotal + platformFee;
    }

    // Validate the final amount
    if (!finalAmount || typeof finalAmount !== "number" || finalAmount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    // Create a payment intent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100), // Convert to smallest currency unit (paise)
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Return the client secret to the client
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);

    return NextResponse.json(
      { error: "Error creating payment intent" },
      { status: 500 }
    );
  }
}
