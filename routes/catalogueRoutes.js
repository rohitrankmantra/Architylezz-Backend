import express from "express";
import uploadCatalogue from "../middlewares/uploadCatalogue.js";
import {
  createCatalogue,
  updateCatalogue,
  deleteCatalogue,
  getAllCatalogues,
  getCatalogueById,
} from "../controllers/catalogueController.js";

const router = express.Router();

// === CRUD Routes ===

// Create catalogue (backend handles PDF upload to Cloudinary)
router.post("/create", uploadCatalogue.single("pdf"), createCatalogue);

// Update catalogue (backend handles new PDF upload if provided)
router.put("/:id", uploadCatalogue.single("pdf"), updateCatalogue);

// Delete catalogue
router.delete("/:id", deleteCatalogue);

// Get all catalogues
router.get("/", getAllCatalogues);

// Get single catalogue
router.get("/:id", getCatalogueById);

// Download / stream PDF
// router.get("/:id/pdf", getCataloguePdf);

export default router;
