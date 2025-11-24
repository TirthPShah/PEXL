export const PAPER_TYPES = ["a4", "colored", "photo"] as const;

export type PaperType = (typeof PAPER_TYPES)[number];

export interface PaperStockEntry {
  quantity: number;
  minThreshold: number;
}

export type PartialPaperStock = Partial<
  Record<PaperType, Partial<PaperStockEntry>>
>;

export type PaperStockRecord = Record<PaperType, PaperStockEntry>;

