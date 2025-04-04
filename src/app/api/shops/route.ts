import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { StationeryShop } from "@/types/stationery";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("pexl_stationery");

    // Get all shops from the shops collection
    const shops = await db
      .collection<StationeryShop>("shops")
      .find({})
      .toArray();

    console.log("Found shops:", shops.length); // Add logging to debug

    return NextResponse.json({ shops });
  } catch (error) {
    console.error("Failed to fetch shops:", error);
    return NextResponse.json(
      {
        error:
          "Failed to fetch shops: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
