import Catalogue from "../models/Catalogue.js";
import cloudinary from "../utils/cloudinary.js";

// Helper: upload buffer → Cloudinary (raw files)
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" }, // keep resource_type: "auto" for PDFs
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

// Helper: generate first-page PDF thumbnail URL
const generateThumbnailUrl = (publicId) => {
  return cloudinary.url(publicId, {
    format: "jpg",
    page: 1,          // first page of PDF
    type: "upload",
  });
};

/* -----------------------------
   Create new catalogue
----------------------------- */
export const createCatalogue = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    const pdfFile = req.file;
    const pdf = await uploadToCloudinary(pdfFile.buffer, "catalogues/pdf");

    const newCatalogue = new Catalogue({
      title,
      description,
      category,
      pdf,
      thumbnail: { url: generateThumbnailUrl(pdf.public_id) }, // ✅ fixed
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
   Update catalogue
----------------------------- */
export const updateCatalogue = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const catalogue = await Catalogue.findById(req.params.id);
    if (!catalogue) return res.status(404).json({ message: "Catalogue not found" });

    if (title) catalogue.title = title;
    if (description) catalogue.description = description;
    if (category) catalogue.category = category;

    if (req.file) {
      if (catalogue.pdf?.public_id) {
        await cloudinary.uploader.destroy(catalogue.pdf.public_id);
      }
      const pdf = await uploadToCloudinary(req.file.buffer, "catalogues/pdf");
      catalogue.pdf = pdf;
      catalogue.thumbnail = { url: generateThumbnailUrl(pdf.public_id) }; // ✅ fixed
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
   Delete catalogue
----------------------------- */
export const deleteCatalogue = async (req, res) => {
  try {
    const catalogue = await Catalogue.findById(req.params.id);
    if (!catalogue) return res.status(404).json({ message: "Catalogue not found" });

    if (catalogue.pdf?.public_id) {
      await cloudinary.uploader.destroy(catalogue.pdf.public_id);
    }

    await Catalogue.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "🗑️ Catalogue deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting catalogue:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* -----------------------------
   Get all catalogues
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
   Get single catalogue by ID
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
