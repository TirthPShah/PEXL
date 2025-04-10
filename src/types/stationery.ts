import { ObjectId } from "mongodb";

export interface StationeryShop {
  _id?: ObjectId | string;
  name: string;
  location: string;
  contact: string;
  status: "online" | "offline";
  priceBW: number;
  priceColor: number;
  ownerMail: string;
}

export interface StationeryOwner {
  _id?: ObjectId | string;
  name: string;
  email: string;
  shopId: ObjectId | string;
  phone?: string;
}
