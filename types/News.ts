import { Document, ObjectId, Schema } from "mongoose";

export interface News extends Document {
  _id: ObjectId;
  title: string;
  title_seo: string;
  content: string;
  image: string;
  author: ObjectId;
  category: string;
  type: "user" | "provider";
  status: "approved" | "pending";
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  url: String;
}
