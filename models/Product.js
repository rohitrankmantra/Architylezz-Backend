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
      type: imageSchema,
      required: true,
    },
    images: {
      type: [imageSchema],
      validate: [(arr) => arr.length > 0, "At least one image is required"],
    },

    // ✅ Changed from String → Array of String
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
    // e.g. 1x2 Feet
    materialType: { type: String }, // e.g. Ceramic
    application: { type: [String] }, // e.g. [LivingRoom, Kitchen]
    brand: { type: String }, // e.g. MyTyles
    quality: { type: String }, // e.g. Premium
    coverageArea: { type: Number }, // e.g. 9.69 (sq. ft)
    pcsPerBox: { type: Number }, // e.g. 5
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);
