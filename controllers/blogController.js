import Blog from "../models/Blog.js";
import cloudinary from "../utils/cloudinary.js";

/* -----------------------------
   Helper: upload buffer → Cloudinary
----------------------------- */
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image", access_mode: "public" },
      (error, result) => {
        if (error) reject(error);
        else
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
      }
    );
    stream.end(fileBuffer);
  });
};

/* -----------------------------
   Create Blog
----------------------------- */
export const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, category, author } = req.body;

    if (!title || !excerpt || !content || !category || !author) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Thumbnail is required" });
    }

    // Upload thumbnail
    const thumbnail = await uploadToCloudinary(req.file.buffer, "blogs/thumbnails");

    const newBlog = new Blog({
      title,
      excerpt,
      content,
      category,
      author,
      thumbnail,
    });

    const savedBlog = await newBlog.save();
    res.status(201).json({ message: "✅ Blog created successfully", blog: savedBlog });
  } catch (error) {
    console.error("❌ Error creating blog:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* -----------------------------
   Get all blogs
----------------------------- */
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (error) {
    console.error("❌ Error fetching blogs:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* -----------------------------
   Get single blog
----------------------------- */
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.status(200).json(blog);
  } catch (error) {
    console.error("❌ Error fetching blog:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* -----------------------------
   Update Blog
----------------------------- */
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const { title, excerpt, content, category, author } = req.body;
    if (title) blog.title = title;
    if (excerpt) blog.excerpt = excerpt;
    if (content) blog.content = content;
    if (category) blog.category = category;
    if (author) blog.author = author;

    // Replace thumbnail if uploaded
    if (req.file) {
      if (blog.thumbnail?.public_id) {
        await cloudinary.uploader.destroy(blog.thumbnail.public_id);
      }
      blog.thumbnail = await uploadToCloudinary(req.file.buffer, "blogs/thumbnails");
    }

    const updatedBlog = await blog.save();
    res.status(200).json({ message: "✅ Blog updated successfully", blog: updatedBlog });
  } catch (error) {
    console.error("❌ Error updating blog:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* -----------------------------
   Delete Blog
----------------------------- */
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Delete thumbnail
    if (blog.thumbnail?.public_id) {
      await cloudinary.uploader.destroy(blog.thumbnail.public_id);
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "🗑️ Blog deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting blog:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
