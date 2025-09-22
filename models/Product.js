// models/Product.js
import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false } // no extra _id for each image object
);

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    thumbnail: {
      type: imageSchema, // ✅ stores { url, public_id }
      required: true,
    },
    images: {
      type: [imageSchema], // ✅ array of { url, public_id }
      validate: [(arr) => arr.length > 0, "At least one image is required"],
    },
    size: {
      type: String,
      required: [true, "Product size is required"],
    },
    category: {
      type: String,
      enum: ["GVT", "Subway", "Wall", "Wood"],
      required: [true, "Product category is required"],
    },
    finish: {
      type: String,
      required: [true, "Product finish is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
