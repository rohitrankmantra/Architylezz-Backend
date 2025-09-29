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

// Routes
router.get("/", getProjects);                                  // GET all projects
router.post("/", uploadProjectImage, createProject);           // CREATE new project (thumbnail + optional images)
router.get("/:id", getProjectById);                            // GET single project
router.put("/:id", uploadProjectImage, updateProject);         // UPDATE project (thumbnail + optional images)
router.delete("/:id", deleteProject);                          // DELETE project

export default router;
