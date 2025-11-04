import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true }, // Local image path
    filename: { type: String, required: true }, // Saved image file name
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

    // ✅ Thumbnail (single image)
    thumbnail: {
      type: imageSchema,
      required: true,
    },

    // ✅ Product images (array of local file paths)
    images: {
      type: [imageSchema],
      validate: [(arr) => arr.length > 0, "At least one image is required"],
    },

    size: {
      type: [String],
      required: [true, "At least one product size is required"],
    },
    category: {
      type: String,
      enum: ["GVT", "Subway", "Wall", "Wood"],
      required: [true, "Product category is required"],
    },
    finish: {
      type: [String],
      required: [true, "At least one product finish is required"],
    },
    filterSize: {
      type: [String],
      required: [true, "At least one filter size is required"],
    },

    metaTitle: {
      type: String,
      trim: true,
      default: "",
    },
    metaDescription: {
      type: String,
      trim: true,
      default: "",
    },
    materialType: { type: String },
    application: { type: [String] },
    brand: { type: String },
    quality: { type: String },
    coverageArea: { type: Number },
    pcsPerBox: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);
