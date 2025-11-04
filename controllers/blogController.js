import fs from "fs";
import path from "path";
import Blog from "../models/Blog.js";

/* -----------------------------
   Helper: build local file URL
----------------------------- */
const getLocalFileUrl = (req, filename, folder) => {
  // Adjust to your server URL if needed
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/uploads/${folder}/${filename}`;
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

    let parsedContent = content;
    try {
      parsedContent = typeof content === "string" ? JSON.parse(content) : content;
    } catch {}

    // Prepare upload folders
    const blogFolder = path.join(process.cwd(), "uploads/blogs");
    if (!fs.existsSync(blogFolder)) fs.mkdirSync(blogFolder, { recursive: true });

    // Thumbnail (optional)
    let thumbnail = null;
    if (req.files?.thumbnail?.[0]) {
      const file = req.files.thumbnail[0];
      thumbnail = {
        url: getLocalFileUrl(req, file.filename, "blogs"),
        filename: file.filename,
      };
    }

    // Images (optional)
    const images = [];
    if (req.files?.images?.length) {
      req.files.images.forEach((file) => {
        images.push({
          url: getLocalFileUrl(req, file.filename, "blogs"),
          filename: file.filename,
        });
      });
    }

    const newBlog = new Blog({
      title,
      excerpt,
      content: parsedContent,
      category,
      author,
      thumbnail,
      images,
    });

    const savedBlog = await newBlog.save();
    res.status(201).json({ message: "✅ Blog created successfully", blog: savedBlog });
  } catch (error) {
    console.error("❌ Error creating blog:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* -----------------------------
   Get All Blogs
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
   Get Blog by ID
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
    if (content) {
      try {
        blog.content = typeof content === "string" ? JSON.parse(content) : content;
      } catch {
        blog.content = content;
      }
    }
    if (category) blog.category = category;
    if (author) blog.author = author;

    // Replace thumbnail if uploaded
    if (req.files?.thumbnail?.[0]) {
      // Delete old thumbnail file if exists
      if (blog.thumbnail?.filename) {
        const oldPath = path.join(process.cwd(), "uploads/blogs", blog.thumbnail.filename);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      const file = req.files.thumbnail[0];
      blog.thumbnail = {
        url: getLocalFileUrl(req, file.filename, "blogs"),
        filename: file.filename,
      };
    }

    // Add new images
    if (req.files?.images?.length) {
      req.files.images.forEach((file) => {
        blog.images.push({
          url: getLocalFileUrl(req, file.filename, "blogs"),
          filename: file.filename,
        });
      });
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

    // Delete local thumbnail
    if (blog.thumbnail?.filename) {
      const thumbPath = path.join(process.cwd(), "uploads/blogs", blog.thumbnail.filename);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }

    // Delete local images
    if (blog.images?.length) {
      for (const img of blog.images) {
        if (img.filename) {
          const imgPath = path.join(process.cwd(), "uploads/blogs", img.filename);
          if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }
      }
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "🗑️ Blog deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting blog:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
