import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import uploadBlogFiles from "../middlewares/uploadBlog.js"; // local multer setup

const router = express.Router();

// ✅ Create new blog (accept thumbnail + multiple images)
router.post("/create", uploadBlogFiles, createBlog);

// ✅ Get all blogs
router.get("/", getAllBlogs);

// ✅ Get single blog by ID
router.get("/:id", getBlogById);

// ✅ Update blog (can re-upload thumbnail/images)
router.put("/:id", uploadBlogFiles, updateBlog);

// ✅ Delete blog
router.delete("/:id", deleteBlog);

export default router;
