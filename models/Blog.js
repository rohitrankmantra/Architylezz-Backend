import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },      // Local file path (e.g. /uploads/blogs/image.jpg)
  filename: { type: String, required: true }, // Saved filename on server
});

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true }, // Tiptap JSON
    category: { type: String, required: true },
    author: { type: String, required: true },

    thumbnail: ImageSchema,   // Single image { url, filename }
    images: [ImageSchema],    // Multiple images
  },
  { timestamps: true }
);

export default mongoose.model("Blog", BlogSchema);
