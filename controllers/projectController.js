// controllers/projectController.js
import Project from "../models/Project.js";
import cloudinary from "../utils/cloudinary.js";

// Helper: upload buffer → Cloudinary (image)
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
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
   Create new project
----------------------------- */
export const createProject = async (req, res) => {
  try {
    const { title, category, description } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (!req.files?.thumbnail) {
      return res.status(400).json({ message: "Thumbnail is required" });
    }

    // Upload thumbnail
    const uploadedThumbnail = await uploadToCloudinary(
      req.files.thumbnail[0].buffer,
      "projects/thumbnails"
    );

    // Upload optional images
    let uploadedImages = [];
    if (req.files?.images) {
      uploadedImages = await Promise.all(
        req.files.images.map((file) => uploadToCloudinary(file.buffer, "projects/images"))
      );
    }

    const newProject = new Project({
      title,
      category,
      description: description || "",
      thumbnail: uploadedThumbnail,
      images: uploadedImages,
    });

    const savedProject = await newProject.save();
    res.status(201).json({
      message: "✅ Project created successfully",
      project: savedProject,
    });
  } catch (err) {
    console.error("❌ Error creating project:", err);
    res
      .status(500)
      .json({ message: "Failed to create project", error: err.message });
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
    if (req.files?.thumbnail) {
      if (project.thumbnail?.public_id) {
        await cloudinary.uploader.destroy(project.thumbnail.public_id);
      }
      const uploadedThumbnail = await uploadToCloudinary(
        req.files.thumbnail[0].buffer,
        "projects/thumbnails"
      );
      project.thumbnail = uploadedThumbnail;
    }

    // Add new images if provided (keep old ones too)
    if (req.files?.images) {
      const uploadedImages = await Promise.all(
        req.files.images.map((file) => uploadToCloudinary(file.buffer, "projects/images"))
      );
      project.images.push(...uploadedImages);
    }

    const updatedProject = await project.save();
    res.status(200).json({
      message: "✅ Project updated successfully",
      project: updatedProject,
    });
  } catch (err) {
    console.error("❌ Error updating project:", err);
    res
      .status(500)
      .json({ message: "Failed to update project", error: err.message });
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
    if (project.thumbnail?.public_id) {
      await cloudinary.uploader.destroy(project.thumbnail.public_id);
    }

    // Delete images
    if (project.images?.length > 0) {
      for (const img of project.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "🗑️ Project deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting project:", err);
    res
      .status(500)
      .json({ message: "Failed to delete project", error: err.message });
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
    res
      .status(500)
      .json({ message: "Failed to fetch projects", error: err.message });
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
    res
      .status(500)
      .json({ message: "Failed to fetch project", error: err.message });
  }
};
