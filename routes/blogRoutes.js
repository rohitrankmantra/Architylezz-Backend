import express from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import uploadBlogFiles from "../middlewares/uploadBlog.js";

const router = express.Router();

// CRUD routes
router.post("/create", uploadBlogFiles, createBlog);
router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.put("/:id", uploadBlogFiles, updateBlog);
router.delete("/:id", deleteBlog);

export default router;
