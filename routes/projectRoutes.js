import express from "express";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import uploadProjectImage from "../middlewares/uploadProjectImage.js"; // handles thumbnail + images

const router = express.Router();

/* -----------------------------
   Project Routes
----------------------------- */

// Get all projects
router.get("/", getProjects);

// Get single project by ID
router.get("/:id", getProjectById);

// Create new project
router.post("/create", uploadProjectImage, createProject);

// Update existing project
router.put("/:id", uploadProjectImage, updateProject);

// Delete project
router.delete("/:id", deleteProject);

export default router;
