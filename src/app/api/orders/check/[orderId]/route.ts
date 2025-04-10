import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    const client = await clientPromise;
    const db = client.db("pexl_orders");

    // Check if there's already an order with this ID
    const existingOrder = await db.collection("active_orders").findOne({
      orderId: orderId,
    });

    return NextResponse.json({
      exists: !!existingOrder,
    });
  } catch (error) {
    console.error("Error checking if order exists:", error);
    return NextResponse.json(
      { error: "Error checking if order exists" },
      { status: 500 }
    );
  }
}
