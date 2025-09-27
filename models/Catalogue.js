import mongoose from "mongoose";

const CatalogueSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["GVT", "Subway", "Wall", "Wood", "General"],
      default: "General",
    },
thumbnail: {
  url: { type: String, required: false },
},
    pdf: {
      public_id: { type: String, required: true }, // Cloudinary public_id
      url: { type: String, required: true },       // Direct Cloudinary URL
    },
  },
  { timestamps: true }
);

export default mongoose.model("Catalogue", CatalogueSchema);
