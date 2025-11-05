import fs from "fs";
import path from "path";
import Catalogue from "../models/Catalogue.js";

/* -----------------------------
   Helper: build local file URL
----------------------------- */
const getLocalFileUrl = (req, filename, folder) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/uploads/${folder}/${filename}`;
};

/* -----------------------------
   Create Catalogue
----------------------------- */
export const createCatalogue = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Prepare upload folders
    const catalogueFolder = path.join(process.cwd(), "uploads/catalogues");
    if (!fs.existsSync(catalogueFolder)) fs.mkdirSync(catalogueFolder, { recursive: true });

    // PDF (required)
    if (!req.files?.pdf?.[0]) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const pdfFile = req.files.pdf[0];
    const pdf = {
      url: getLocalFileUrl(req, pdfFile.filename, "catalogues"),
      filename: pdfFile.filename,
    };

    // Thumbnail (optional)
    let thumbnail = null;
    if (req.files?.thumbnail?.[0]) {
      const file = req.files.thumbnail[0];
      thumbnail = {
        url: getLocalFileUrl(req, file.filename, "catalogues"),
        filename: file.filename,
      };
    }

    const newCatalogue = new Catalogue({
      title,
      description,
      category,
      pdf,
      thumbnail,
    });

    const savedCatalogue = await newCatalogue.save();
    res.status(201).json({ message: "✅ Catalogue created successfully", catalogue: savedCatalogue });
  } catch (error) {
    console.error("❌ Error creating catalogue:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* -----------------------------
   Get All Catalogues
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
   Get Catalogue by ID
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

/* -----------------------------
   Update Catalogue
----------------------------- */
export const updateCatalogue = async (req, res) => {
  try {
    const catalogue = await Catalogue.findById(req.params.id);
    if (!catalogue) return res.status(404).json({ message: "Catalogue not found" });

    const { title, description, category } = req.body;
    if (title) catalogue.title = title;
    if (description) catalogue.description = description;
    if (category) catalogue.category = category;

    const folder = path.join(process.cwd(), "uploads/catalogues");

    // Replace PDF if uploaded
    if (req.files?.pdf?.[0]) {
      if (catalogue.pdf?.filename) {
        const oldPdf = path.join(folder, catalogue.pdf.filename);
        if (fs.existsSync(oldPdf)) fs.unlinkSync(oldPdf);
      }
      const file = req.files.pdf[0];
      catalogue.pdf = {
        url: getLocalFileUrl(req, file.filename, "catalogues"),
        filename: file.filename,
      };
    }

    // Replace thumbnail if uploaded
    if (req.files?.thumbnail?.[0]) {
      if (catalogue.thumbnail?.filename) {
        const oldThumb = path.join(folder, catalogue.thumbnail.filename);
        if (fs.existsSync(oldThumb)) fs.unlinkSync(oldThumb);
      }
      const file = req.files.thumbnail[0];
      catalogue.thumbnail = {
        url: getLocalFileUrl(req, file.filename, "catalogues"),
        filename: file.filename,
      };
    }

    const updatedCatalogue = await catalogue.save();
    res.status(200).json({ message: "✅ Catalogue updated successfully", catalogue: updatedCatalogue });
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

    const folder = path.join(process.cwd(), "uploads/catalogues");

    // Delete local PDF
    if (catalogue.pdf?.filename) {
      const pdfPath = path.join(folder, catalogue.pdf.filename);
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    }

    // Delete local thumbnail
    if (catalogue.thumbnail?.filename) {
      const thumbPath = path.join(folder, catalogue.thumbnail.filename);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }

    await Catalogue.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "🗑️ Catalogue deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting catalogue:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
