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

// ✅ Create catalogue (PDF required, thumbnail optional)
router.post(
  "/create",
  uploadCatalogue.fields([
    { name: "pdf", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }, // optional
  ]),
  createCatalogue
);

// ✅ Update catalogue (PDF or thumbnail can be replaced)
router.put(
  "/:id",
  uploadCatalogue.fields([
    { name: "pdf", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }, // optional
  ]),
  updateCatalogue
);

// ✅ Delete catalogue
router.delete("/:id", deleteCatalogue);

// ✅ Get all catalogues
router.get("/", getAllCatalogues);

// ✅ Get single catalogue by ID
router.get("/:id", getCatalogueById);

export default router;
