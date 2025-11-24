import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { normalizePaperStock } from "@/lib/paperStock";
import { PartialPaperStock } from "@/types/paper";

interface Params {
  params: { shopId: string };
}

export async function GET(request: Request, { params }: Params) {
  const { shopId } = params;

  if (!ObjectId.isValid(shopId)) {
    return NextResponse.json({ error: "Invalid shop ID" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("pexl_stationery");
    const shop = await db.collection("shops").findOne({ _id: new ObjectId(shopId) });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    return NextResponse.json({
      paperStock: normalizePaperStock(shop.paperStock),
    });
  } catch (error) {
    console.error("Failed to fetch inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { shopId } = params;

  if (!ObjectId.isValid(shopId)) {
    return NextResponse.json({ error: "Invalid shop ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const updates: PartialPaperStock = body?.updates;

    if (!updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "Inventory updates are required" },
        { status: 400 }
      );
    }

    const setOps: Record<string, number> = {};
    Object.entries(updates).forEach(([type, values]) => {
      if (values?.quantity !== undefined) {
        setOps[`paperStock.${type}.quantity`] = Math.max(0, Number(values.quantity));
      }
      if (values?.minThreshold !== undefined) {
        setOps[`paperStock.${type}.minThreshold`] = Math.max(
          0,
          Number(values.minThreshold)
        );
      }
    });

    if (Object.keys(setOps).length === 0) {
      return NextResponse.json(
        { error: "No valid inventory fields provided" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("pexl_stationery");

    await db
      .collection("shops")
      .updateOne({ _id: new ObjectId(shopId) }, { $set: setOps }, { upsert: false });

    const updatedShop = await db
      .collection("shops")
      .findOne({ _id: new ObjectId(shopId) });

    return NextResponse.json({
      paperStock: normalizePaperStock(updatedShop?.paperStock),
    });
  } catch (error) {
    console.error("Failed to update inventory:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}

