import mongoose, { Schema, models } from "mongoose";
import { User } from "../../types/User";

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, default: "user.png" },
    role: {
      type: String,
      enum: ["admin", "user", "provider"],
      default: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const UserModel = models.User || mongoose.model<User>("User", userSchema);

export default UserModel;
