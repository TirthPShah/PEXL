import {
  PAPER_TYPES,
  PaperStockEntry,
  PaperStockRecord,
  PaperType,
  PartialPaperStock,
} from "@/types/paper";

export const paperTypeMeta: Record<
  PaperType,
  { label: string; description: string }
> = {
  a4: { label: "A4 Paper", description: "Standard 80gsm sheets" },
  colored: { label: "Colored Sheets", description: "Tinted A4 stock" },
  photo: { label: "Photo Paper", description: "Glossy photo stock" },
};

export const emptyPaperStock = (): PaperStockRecord =>
  PAPER_TYPES.reduce(
    (acc, type) => ({
      ...acc,
      [type]: { quantity: 0, minThreshold: 0 },
    }),
    {} as PaperStockRecord
  );

export const normalizePaperStock = (
  stock?: PartialPaperStock
): PaperStockRecord => {
  const base = emptyPaperStock();
  if (!stock) return base;

  return PAPER_TYPES.reduce((acc, type) => {
    acc[type] = {
      quantity: Math.max(0, stock[type]?.quantity ?? 0),
      minThreshold: Math.max(0, stock[type]?.minThreshold ?? 0),
    };
    return acc;
  }, base);
};

export const computeSheetsNeeded = (pageCount = 1, isDoubleSided = true) =>
  isDoubleSided ? Math.ceil(pageCount / 2) : pageCount;

export const inferPaperType = (
  paperType: PaperType | undefined,
  isBlackAndWhite: boolean
): PaperType => {
  if (paperType) return paperType;
  return isBlackAndWhite ? "a4" : "colored";
};

export type StockAdjustment = Partial<Record<PaperType, number>>;

export const buildStockIncPayload = (usage: StockAdjustment) => {
  const payload: Record<string, number> = {};
  Object.entries(usage).forEach(([type, qty]) => {
    if (qty && qty !== 0) {
      payload[`paperStock.${type}.quantity`] = qty;
    }
  });
  return payload;
};

