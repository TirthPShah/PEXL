import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { orderId, orderData } = await request.json();

    // Validate request data
    if (!orderId || !orderData) {
      return NextResponse.json(
        { error: "Order ID and order data are required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("pexl_orders");

    // Get collections
    const activeOrdersCollection = db.collection("active_orders");
    const completedOrdersCollection = db.collection("completed_orders");

    // Prepare the order object for completed_orders collection
    // Add completion timestamp and ensure the _id is properly handled
    const completedOrder = {
      ...orderData,
      completedAt: new Date().toISOString(),
      status: "completed",
    };

    // Remove the MongoDB _id from the completed order as it will be auto-generated
    delete completedOrder._id;

    // Insert the order into completed_orders collection
    const insertResult = await completedOrdersCollection.insertOne(
      completedOrder
    );

    if (!insertResult.acknowledged) {
      throw new Error(
        "Failed to insert order into completed_orders collection"
      );
    }

    // Remove the order from active_orders collection
    const deleteResult = await activeOrdersCollection.deleteOne({
      _id: new ObjectId(orderId),
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { error: "Order not found or already completed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order marked as complete successfully",
      completedOrderId: insertResult.insertedId,
    });
  } catch (error) {
    console.error("Error completing order:", error);
    return NextResponse.json(
      { error: "Failed to complete order" },
      { status: 500 }
    );
  }
}
