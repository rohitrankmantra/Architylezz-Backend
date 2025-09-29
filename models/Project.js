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
    thumbnail: {
      url: { type: String, required: true },      // Cloudinary secure_url
      public_id: { type: String, required: true } // Cloudinary public_id
    },
    images: [
      {
        url: { type: String },        // not required → optional
        public_id: { type: String },  // not required → optional
      },
    ], // optional: user can skip uploading
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);

export default Project;
