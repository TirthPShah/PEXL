import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("pexl_orders");

    const orderData = {
      ...body,
      status: "active",
      createdAt: new Date(),
    };

    const result = await db.collection("active_orders").insertOne(orderData);

    return NextResponse.json({
      success: true,
      orderId: result.insertedId.toHexString(),
    });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("pexl_orders");

    const activeOrders = await db
      .collection("active_orders")
      .find({})
      .toArray();
    const completedOrders = await db
      .collection("completed_orders")
      .find({})
      .toArray();

    return NextResponse.json({
      activeOrders,
      completedOrders,
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
