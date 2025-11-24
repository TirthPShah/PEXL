import React, { useEffect, useMemo, useState } from "react";
import { PaperType } from "@/types/paper";
import { paperTypeMeta } from "@/lib/paperStock";
import { Loader2 } from "lucide-react";

interface AnalyticsResponse {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    repeatCustomers: number;
    uniqueCustomers: number;
  };
  dailyMetrics: { date: string; orders: number; revenue: number }[];
  popularPrintTypes: { type: PaperType; count: number }[];
}

interface AnalyticsPanelProps {
  ownerMail?: string | null;
  shopId?: string;
}

const ranges = [
  { label: "7 days", value: 7 },
  { label: "14 days", value: 14 },
  { label: "30 days", value: 30 },
];

export function AnalyticsPanel({ ownerMail, shopId }: AnalyticsPanelProps) {
  const [range, setRange] = useState<number>(14);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!ownerMail) return;
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        ownerMail,
        rangeDays: String(range),
      });
      if (shopId) {
        params.append("shopId", shopId);
      }

      try {
        const response = await fetch(`/api/orders/analytics?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to load analytics");
        }
        const payload = await response.json();
        setData(payload);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [ownerMail, shopId, range]);

  const maxRevenue = useMemo(() => {
    if (!data?.dailyMetrics?.length) return 0;
    return Math.max(...data.dailyMetrics.map((metric) => metric.revenue));
  }, [data]);

  if (!ownerMail) {
    return (
      <div className="p-6 border rounded-xl bg-white text-sm text-gray-600">
        Sign in as a shop owner to view analytics.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border p-8 flex flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-3" />
        <p className="text-gray-600 text-sm">Crunching numbers…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Performance overview
        </h3>
        <div className="flex gap-2">
          {ranges.map((option) => (
            <button
              key={option.value}
              onClick={() => setRange(option.value)}
              className={`px-3 py-1.5 rounded-full text-sm ${
                range === option.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border rounded-xl p-4 bg-white">
          <p className="text-xs uppercase text-gray-500">Revenue</p>
          <p className="text-2xl font-semibold">
            ₹{data.summary.totalRevenue.toFixed(0)}
          </p>
        </div>
        <div className="border rounded-xl p-4 bg-white">
          <p className="text-xs uppercase text-gray-500">Orders</p>
          <p className="text-2xl font-semibold">{data.summary.totalOrders}</p>
        </div>
        <div className="border rounded-xl p-4 bg-white">
          <p className="text-xs uppercase text-gray-500">Repeat customers</p>
          <p className="text-2xl font-semibold">
            {data.summary.repeatCustomers}
          </p>
        </div>
        <div className="border rounded-xl p-4 bg-white">
          <p className="text-xs uppercase text-gray-500">Unique customers</p>
          <p className="text-2xl font-semibold">
            {data.summary.uniqueCustomers}
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <p className="font-medium mb-4 text-gray-900">Daily revenue</p>
        {data.dailyMetrics.length === 0 ? (
          <p className="text-sm text-gray-500">No completed orders yet.</p>
        ) : (
          <div className="flex items-end gap-3 h-48">
            {data.dailyMetrics.map((metric) => {
              const height =
                maxRevenue === 0 ? 0 : (metric.revenue / maxRevenue) * 100;
              return (
                <div key={metric.date} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-blue-100 rounded-t-md flex items-end justify-center">
                    <div
                      className="w-full bg-blue-600 rounded-t-md transition-all"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(metric.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                  <p className="text-xs font-medium text-gray-700">
                    ₹{metric.revenue.toFixed(0)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white border rounded-xl p-6">
        <p className="font-medium mb-4 text-gray-900">
          Popular print types
        </p>
        <div className="space-y-3">
          {data.popularPrintTypes.map((item) => (
            <div key={item.type} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {paperTypeMeta[item.type].label}
                </p>
                <p className="text-xs text-gray-500">
                  {paperTypeMeta[item.type].description}
                </p>
              </div>
              <span className="text-sm font-semibold">
                {item.count} orders
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

