import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ Thumbnail (local file)
    thumbnail: {
      url: { type: String, required: true },      // Local path (e.g., /uploads/projects/thumbnail.jpg)
      filename: { type: String, required: true }, // Saved file name
    },

    // ✅ Images (optional array of local files)
    images: [
      {
        url: { type: String },      // Local path
        filename: { type: String }, // Saved file name
      },
    ],

    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);

export default Project;
