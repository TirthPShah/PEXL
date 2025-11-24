import React, { useEffect, useMemo, useState } from "react";
import {
  PAPER_TYPES,
  PaperStockRecord,
  PaperType,
  PartialPaperStock,
} from "@/types/paper";
import { paperTypeMeta } from "@/lib/paperStock";
import { Loader2 } from "lucide-react";

interface InventoryPanelProps {
  stock: PaperStockRecord | null;
  loading: boolean;
  onSave: (payload: PartialPaperStock) => Promise<PaperStockRecord | null>;
}

export function InventoryPanel({
  stock,
  loading,
  onSave,
}: InventoryPanelProps) {
  const [draft, setDraft] = useState<PaperStockRecord | null>(stock);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (stock) {
      setDraft(stock);
    }
  }, [stock]);

  const lowStockTypes = useMemo(() => {
    if (!draft) return [];
    return PAPER_TYPES.filter(
      (type) => draft[type].quantity <= draft[type].minThreshold
    );
  }, [draft]);

  const handleInputChange = (
    type: PaperType,
    field: "quantity" | "minThreshold",
    value: number
  ) => {
    if (!draft) return;
    setDraft({
      ...draft,
      [type]: {
        ...draft[type],
        [field]: Math.max(0, value),
      },
    });
  };

  const handleSave = async () => {
    if (!draft || !stock) {
      setFeedback("Nothing to save yet.");
      return;
    }

    const payload: PartialPaperStock = {};
    PAPER_TYPES.forEach((type) => {
      if (
        draft[type].quantity !== stock[type].quantity ||
        draft[type].minThreshold !== stock[type].minThreshold
      ) {
        payload[type] = {
          quantity: draft[type].quantity,
          minThreshold: draft[type].minThreshold,
        };
      }
    });

    if (Object.keys(payload).length === 0) {
      setFeedback("No changes detected.");
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);
      const updated = await onSave(payload);
      if (updated) {
        setDraft(updated);
        setFeedback("Inventory updated successfully.");
      }
    } catch (error) {
      setFeedback("Failed to save inventory changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !draft) {
    return (
      <div className="bg-white rounded-xl border p-8 flex flex-col items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-3" />
        <p className="text-gray-600 text-sm">Loading inventory…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PAPER_TYPES.map((type) => {
          const entry = draft[type];
          const isLowStock = entry.quantity <= entry.minThreshold;

          return (
            <div
              key={type}
              className="bg-white border rounded-xl p-4 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {paperTypeMeta[type].label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {paperTypeMeta[type].description}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    isLowStock
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {isLowStock ? "Low stock" : "Healthy"}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">
                  On-hand quantity
                </label>
                <input
                  type="number"
                  min={0}
                  value={entry.quantity}
                  onChange={(event) =>
                    handleInputChange(
                      type,
                      "quantity",
                      Number(event.target.value)
                    )
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">
                  Low-stock threshold
                </label>
                <input
                  type="number"
                  min={0}
                  value={entry.minThreshold}
                  onChange={(event) =>
                    handleInputChange(
                      type,
                      "minThreshold",
                      Number(event.target.value)
                    )
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          );
        })}
      </div>

      {lowStockTypes.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          Heads up: {lowStockTypes.map((type) => paperTypeMeta[type].label).join(", ")}{" "}
          {(lowStockTypes.length === 1 ? "is" : "are")} below the configured
          threshold.
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-5 py-2 rounded-lg font-medium ${
            saving
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {saving ? "Saving…" : "Save Inventory"}
        </button>
        {feedback && <span className="text-sm text-gray-600">{feedback}</span>}
      </div>
    </div>
  );
}

