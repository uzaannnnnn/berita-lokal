import mongoose, { Schema, models } from "mongoose";
import { News } from "../../types/News";

const NewsSchema = new Schema<News>(
  {
    title: { type: String, required: true, unique: true },
    title_seo: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    url: { type: String },
    category: { type: String, required: true, index: true },
    type: { type: String, default: "user" },
    status: {
      type: String,
      enum: ["approved", "rejected", "pending"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

NewsSchema.index({
  status: 1,
  category: 1,
  createdAt: -1,
});

const NewsModel = models.News || mongoose.model<News>("News", NewsSchema);

export default NewsModel;
