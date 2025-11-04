import fs from "fs";
import path from "path";
import Catalogue from "../models/Catalogue.js";

/* -----------------------------
   Create new Catalogue
----------------------------- */
export const createCatalogue = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (!req.files?.pdf) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    // Prepare directories
    const uploadDir = path.join(process.cwd(), "uploads/catalogues");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // PDF file
    const pdfFile = req.files.pdf[0];
    const pdfUrl = `${req.protocol}://${req.get("host")}/uploads/catalogues/${pdfFile.filename}`;

    // Optional thumbnail
    let thumbnailData = null;
    if (req.files?.thumbnail) {
      const thumbFile = req.files.thumbnail[0];
      const thumbUrl = `${req.protocol}://${req.get("host")}/uploads/catalogues/${thumbFile.filename}`;
      thumbnailData = { url: thumbUrl, filename: thumbFile.filename };
    }

    const newCatalogue = new Catalogue({
      title,
      description,
      category,
      pdf: { url: pdfUrl, filename: pdfFile.filename },
      thumbnail: thumbnailData,
    });

    const savedCatalogue = await newCatalogue.save();
    res.status(201).json({
      message: "✅ Catalogue created successfully",
      catalogue: savedCatalogue,
    });
  } catch (error) {
    console.error("❌ Error creating catalogue:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* -----------------------------
   Update Catalogue
----------------------------- */
export const updateCatalogue = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const catalogue = await Catalogue.findById(req.params.id);
    if (!catalogue) return res.status(404).json({ message: "Catalogue not found" });

    if (title) catalogue.title = title;
    if (description) catalogue.description = description;
    if (category) catalogue.category = category;

    const uploadDir = path.join(process.cwd(), "uploads/catalogues");

    // Update PDF
    if (req.files?.pdf) {
      const oldPdfPath = catalogue.pdf?.filename ? path.join(uploadDir, catalogue.pdf.filename) : null;
      if (oldPdfPath && fs.existsSync(oldPdfPath)) fs.unlinkSync(oldPdfPath);

      const pdfFile = req.files.pdf[0];
      catalogue.pdf = {
        url: `${req.protocol}://${req.get("host")}/uploads/catalogues/${pdfFile.filename}`,
        filename: pdfFile.filename,
      };
    }

    // Update thumbnail (optional)
    if (req.files?.thumbnail) {
      const oldThumbPath = catalogue.thumbnail?.filename ? path.join(uploadDir, catalogue.thumbnail.filename) : null;
      if (oldThumbPath && fs.existsSync(oldThumbPath)) fs.unlinkSync(oldThumbPath);

      const thumbFile = req.files.thumbnail[0];
      catalogue.thumbnail = {
        url: `${req.protocol}://${req.get("host")}/uploads/catalogues/${thumbFile.filename}`,
        filename: thumbFile.filename,
      };
    }

    const updatedCatalogue = await catalogue.save();
    res.status(200).json({
      message: "✅ Catalogue updated successfully",
      catalogue: updatedCatalogue,
    });
  } catch (error) {
    console.error("❌ Error updating catalogue:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* -----------------------------
   Delete Catalogue
----------------------------- */
export const deleteCatalogue = async (req, res) => {
  try {
    const catalogue = await Catalogue.findById(req.params.id);
    if (!catalogue) return res.status(404).json({ message: "Catalogue not found" });

    const uploadDir = path.join(process.cwd(), "uploads/catalogues");

    // Delete PDF
    if (catalogue.pdf?.filename) {
      const pdfPath = path.join(uploadDir, catalogue.pdf.filename);
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    }

    // Delete thumbnail
    if (catalogue.thumbnail?.filename) {
      const thumbPath = path.join(uploadDir, catalogue.thumbnail.filename);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }

    await Catalogue.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "🗑️ Catalogue deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting catalogue:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* -----------------------------
   Get all Catalogues
----------------------------- */
export const getAllCatalogues = async (req, res) => {
  try {
    const catalogues = await Catalogue.find().sort({ createdAt: -1 });
    res.status(200).json(catalogues);
  } catch (error) {
    console.error("❌ Error fetching catalogues:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* -----------------------------
   Get single Catalogue
----------------------------- */
export const getCatalogueById = async (req, res) => {
  try {
    const catalogue = await Catalogue.findById(req.params.id);
    if (!catalogue) return res.status(404).json({ message: "Catalogue not found" });
    res.status(200).json(catalogue);
  } catch (error) {
    console.error("❌ Error fetching catalogue:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
