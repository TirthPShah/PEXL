import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { StationeryShop } from "@/types/stationery";

interface Params {
  params: { shopId: string };
}

export async function GET(request: Request, { params }: Params) {
  const { shopId } = params;

  try {
    const client = await clientPromise;
    const db = client.db("pexl_stationery");

    // Validate ObjectId format
    if (!ObjectId.isValid(shopId)) {
      return NextResponse.json({ error: "Invalid shop ID" }, { status: 400 });
    }

    const shop = await db
      .collection<StationeryShop>("shops")
      .findOne({ _id: new ObjectId(shopId) });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    return NextResponse.json({ shop });
  } catch (error) {
    console.error("Failed to fetch shop:", error);
    return NextResponse.json(
      { error: "Failed to fetch shop details" },
      { status: 500 }
    );
  }
}
