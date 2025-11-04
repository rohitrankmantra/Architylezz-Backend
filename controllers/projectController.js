import Project from "../models/Project.js";
import fs from "fs";
import path from "path";

/* -----------------------------
   Helper: delete local file
----------------------------- */
const deleteLocalFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error("Error deleting local file:", err);
  }
};

/* -----------------------------
   Create new project
----------------------------- */
export const createProject = async (req, res) => {
  try {
    const { title, category, description } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (!req.files?.thumbnail || req.files.thumbnail.length === 0) {
      return res.status(400).json({ message: "Thumbnail is required" });
    }

    // Handle thumbnail
    const thumbnailFile = req.files.thumbnail[0];
    const thumbnail = {
      url: `/uploads/projects/${thumbnailFile.filename}`,
      filename: thumbnailFile.filename,
    };

    // Handle optional images
    const images = req.files?.images
      ? req.files.images.map((file) => ({
          url: `/uploads/projects/${file.filename}`,
          filename: file.filename,
        }))
      : [];

    const newProject = new Project({
      title,
      category,
      description: description || "",
      thumbnail,
      images,
    });

    const savedProject = await newProject.save();
    res.status(201).json({
      message: "✅ Project created successfully",
      project: savedProject,
    });
  } catch (err) {
    console.error("❌ Error creating project:", err);
    res.status(500).json({
      message: "Failed to create project",
      error: err.message,
    });
  }
};

/* -----------------------------
   Update project
----------------------------- */
export const updateProject = async (req, res) => {
  try {
    const { title, category, description } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (title) project.title = title;
    if (category) project.category = category;
    if (description !== undefined) project.description = description;

    // Replace thumbnail if new one uploaded
    if (req.files?.thumbnail && req.files.thumbnail.length > 0) {
      if (project.thumbnail?.filename) {
        deleteLocalFile(
          path.join(process.cwd(), "uploads/projects", project.thumbnail.filename)
        );
      }

      const thumbnailFile = req.files.thumbnail[0];
      project.thumbnail = {
        url: `/uploads/projects/${thumbnailFile.filename}`,
        filename: thumbnailFile.filename,
      };
    }

    // Replace images if new ones uploaded
    if (req.files?.images && req.files.images.length > 0) {
      // Delete old images first
      if (Array.isArray(project.images) && project.images.length > 0) {
        for (const img of project.images) {
          if (img.filename) {
            deleteLocalFile(
              path.join(process.cwd(), "uploads/projects", img.filename)
            );
          }
        }
      }

      project.images = req.files.images.map((file) => ({
        url: `/uploads/projects/${file.filename}`,
        filename: file.filename,
      }));
    }

    const updatedProject = await project.save();
    res.status(200).json({
      message: "✅ Project updated successfully",
      project: updatedProject,
    });
  } catch (err) {
    console.error("❌ Error updating project:", err);
    res.status(500).json({
      message: "Failed to update project",
      error: err.message,
    });
  }
};

/* -----------------------------
   Delete project
----------------------------- */
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Delete thumbnail
    if (project.thumbnail?.filename) {
      deleteLocalFile(
        path.join(process.cwd(), "uploads/projects", project.thumbnail.filename)
      );
    }

    // Delete images
    if (Array.isArray(project.images) && project.images.length > 0) {
      for (const img of project.images) {
        if (img.filename) {
          deleteLocalFile(
            path.join(process.cwd(), "uploads/projects", img.filename)
          );
        }
      }
    }

    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "🗑️ Project deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting project:", err);
    res.status(500).json({
      message: "Failed to delete project",
      error: err.message,
    });
  }
};

/* -----------------------------
   Get all projects
----------------------------- */
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (err) {
    console.error("❌ Error fetching projects:", err);
    res.status(500).json({
      message: "Failed to fetch projects",
      error: err.message,
    });
  }
};

/* -----------------------------
   Get single project by ID
----------------------------- */
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.status(200).json(project);
  } catch (err) {
    console.error("❌ Error fetching project:", err);
    res.status(500).json({
      message: "Failed to fetch project",
      error: err.message,
    });
  }
};
