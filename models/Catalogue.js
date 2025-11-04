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

    // Optional thumbnail
    thumbnail: {
      url: { type: String, required: false },      // Local image path or public URL
      filename: { type: String, required: false }, // Saved file name
    },

    // Required PDF
    pdf: {
      url: { type: String, required: true },       // Local PDF path or public URL
      filename: { type: String, required: true },  // Saved file name
    },
  },
  { timestamps: true }
);

// Avoid model overwrite issues in development with Next.js hot reload
export default mongoose.models.Catalogue || mongoose.model("Catalogue", CatalogueSchema);
