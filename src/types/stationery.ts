import { ObjectId } from "mongodb";
import { PaperStockRecord } from "./paper";

export interface StationeryShop {
  _id?: ObjectId | string;
  name: string;
  location: string;
  contact: string;
  status: "online" | "offline";
  priceBW: number;
  priceColor: number;
  ownerMail: string;
  paperStock?: PaperStockRecord;
}

export interface StationeryOwner {
  _id?: ObjectId | string;
  name: string;
  email: string;
  shopId: ObjectId | string;
  phone?: string;
}
