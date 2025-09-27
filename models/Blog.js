import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true }, // Stores Tiptap JSON
    category: { type: String, required: true },
    author: { type: String, required: true },

    thumbnail: {
      public_id: { type: String },
      url: { type: String },
    },

    images: [
      {
        public_id: String,
        url: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Blog", BlogSchema);
