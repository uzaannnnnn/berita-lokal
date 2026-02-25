import { Document, ObjectId } from "mongoose";

export interface User extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  image: string;
  role: "admin" | "user" | "provider";
  createdAt: Date;
  updatedAt: Date;
}
