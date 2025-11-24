import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { PAPER_TYPES, PaperType } from "@/types/paper";
import { inferPaperType } from "@/lib/paperStock";

interface DailyMetric {
  date: string;
  orders: number;
  revenue: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerMail = searchParams.get("ownerMail");
    const shopId = searchParams.get("shopId") || undefined;
    const rangeDays = Number(searchParams.get("rangeDays") || 14);

    if (!ownerMail) {
      return NextResponse.json(
        { error: "ownerMail query parameter is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("pexl_orders");

    const match: Record<string, any> = {
      "shop.ownerMail": ownerMail,
    };
    if (shopId) {
      match["shop.id"] = shopId;
    }

    const lookbackStart = new Date();
    lookbackStart.setDate(lookbackStart.getDate() - (rangeDays - 1));

    const completedOrders = await db
      .collection("completed_orders")
      .find(match)
      .toArray();

    const dayMap = new Map<string, DailyMetric>();
    const popularTypes: Record<PaperType, number> = {
      a4: 0,
      colored: 0,
      photo: 0,
    };
    const customerOrderCounts = new Map<string, number>();

    for (let i = 0; i < rangeDays; i += 1) {
      const day = new Date(lookbackStart);
      day.setDate(lookbackStart.getDate() + i);
      const key = day.toISOString().slice(0, 10);
      dayMap.set(key, { date: key, orders: 0, revenue: 0 });
    }

    completedOrders.forEach((order) => {
      const completedAt = order?.completedAt
        ? new Date(order.completedAt)
        : null;

      if (
        !completedAt ||
        completedAt.getTime() < lookbackStart.getTime()
      ) {
        return;
      }
      const dayKey = completedAt
        ? new Date(
            Date.UTC(
              completedAt.getFullYear(),
              completedAt.getMonth(),
              completedAt.getDate()
            )
          )
            .toISOString()
            .slice(0, 10)
        : null;

      if (dayKey && dayMap.has(dayKey)) {
        const entry = dayMap.get(dayKey)!;
        entry.orders += 1;
        entry.revenue += Number(order.totalPrice || 0);
      }

      (order.files || []).forEach((file: any) => {
        const type = inferPaperType(
          file?.paperType as PaperType | undefined,
          !!file?.isBlackAndWhite
        );
        popularTypes[type] += 1;
      });

      if (order.customerEmail) {
        customerOrderCounts.set(
          order.customerEmail,
          (customerOrderCounts.get(order.customerEmail) || 0) + 1
        );
      }
    });

    const repeatCustomers = Array.from(customerOrderCounts.values()).filter(
      (count) => count > 1
    ).length;

    const dailyMetrics = Array.from(dayMap.values());
    const totalOrders = dailyMetrics.reduce((sum, day) => sum + day.orders, 0);
    const totalRevenue = dailyMetrics.reduce(
      (sum, day) => sum + day.revenue,
      0
    );

    const popularPrintTypes = PAPER_TYPES.sort(
      (a, b) => popularTypes[b] - popularTypes[a]
    ).map((type) => ({
      type,
      count: popularTypes[type],
    }));

    return NextResponse.json({
      summary: {
        totalOrders,
        totalRevenue,
        repeatCustomers,
        uniqueCustomers: customerOrderCounts.size,
      },
      dailyMetrics,
      popularPrintTypes,
    });
  } catch (error) {
    console.error("Failed to compute analytics:", error);
    return NextResponse.json(
      { error: "Failed to compute analytics" },
      { status: 500 }
    );
  }
}

