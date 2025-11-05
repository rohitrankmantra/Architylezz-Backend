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
   Helper: build full URL
----------------------------- */
const buildUrl = (req, filePath) => {
  if (!filePath) return null;
  return filePath.startsWith("http")
    ? filePath
    : `${req.protocol}://${req.get("host")}${filePath.startsWith("/") ? filePath : `/uploads/projects/${filePath}`}`;
};

/* -----------------------------
   Create Project
----------------------------- */
export const createProject = async (req, res) => {
  try {
    const { title, category, description } = req.body;

    if (!title || !category) return res.status(400).json({ message: "Please fill all required fields" });
    if (!req.files?.thumbnail?.[0]) return res.status(400).json({ message: "Thumbnail is required" });

    const thumbnailFile = req.files.thumbnail[0];
    const thumbnail = { url: buildUrl(req, thumbnailFile.filename), filename: thumbnailFile.filename };
    const images = req.files?.images?.map(f => ({ url: buildUrl(req, f.filename), filename: f.filename })) || [];

    const project = new Project({ title, category, description: description || "", thumbnail, images });
    const savedProject = await project.save();

    res.status(201).json({ message: "✅ Project created successfully", project: savedProject });
  } catch (err) {
    console.error("❌ Error creating project:", err);
    res.status(500).json({ message: "Failed to create project", error: err.message });
  }
};

/* -----------------------------
   Update Project
----------------------------- */
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const { title, category, description } = req.body;
    if (title) project.title = title;
    if (category) project.category = category;
    if (description !== undefined) project.description = description;

    // Update thumbnail
    if (req.files?.thumbnail?.[0]) {
      if (project.thumbnail?.filename) deleteLocalFile(path.join(process.cwd(), "uploads/projects", project.thumbnail.filename));
      const f = req.files.thumbnail[0];
      project.thumbnail = { url: buildUrl(req, f.filename), filename: f.filename };
    }

    // Update images
    if (req.files?.images?.length) {
      if (Array.isArray(project.images)) {
        project.images.forEach(img => img.filename && deleteLocalFile(path.join(process.cwd(), "uploads/projects", img.filename)));
      }
      project.images = req.files.images.map(f => ({ url: buildUrl(req, f.filename), filename: f.filename }));
    }

    const updatedProject = await project.save();
    res.status(200).json({ message: "✅ Project updated successfully", project: updatedProject });
  } catch (err) {
    console.error("❌ Error updating project:", err);
    res.status(500).json({ message: "Failed to update project", error: err.message });
  }
};

/* -----------------------------
   Delete Project
----------------------------- */
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.thumbnail?.filename) deleteLocalFile(path.join(process.cwd(), "uploads/projects", project.thumbnail.filename));
    if (Array.isArray(project.images)) project.images.forEach(img => img.filename && deleteLocalFile(path.join(process.cwd(), "uploads/projects", img.filename)));

    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "🗑️ Project deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting project:", err);
    res.status(500).json({ message: "Failed to delete project", error: err.message });
  }
};

/* -----------------------------
   Get All Projects
----------------------------- */
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    const updatedProjects = projects.map(p => ({
      ...p._doc,
      thumbnail: { ...p.thumbnail, url: buildUrl(req, p.thumbnail?.url) },
      images: Array.isArray(p.images) ? p.images.map(img => ({ ...img, url: buildUrl(req, img.url) })) : [],
    }));
    res.status(200).json(updatedProjects);
  } catch (err) {
    console.error("❌ Error fetching projects:", err);
    res.status(500).json({ message: "Failed to fetch projects", error: err.message });
  }
};

/* -----------------------------
   Get Project by ID
----------------------------- */
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const updatedProject = {
      ...project._doc,
      thumbnail: { ...project.thumbnail, url: buildUrl(req, project.thumbnail?.url) },
      images: Array.isArray(project.images) ? project.images.map(img => ({ ...img, url: buildUrl(req, img.url) })) : [],
    };
    res.status(200).json(updatedProject);
  } catch (err) {
    console.error("❌ Error fetching project:", err);
    res.status(500).json({ message: "Failed to fetch project", error: err.message });
  }
};
