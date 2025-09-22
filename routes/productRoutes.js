import express from "express";
import upload from "../middlewares/multer.js";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Create product
router.post(
  "/",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  createProduct
);

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProductById);

// Update product ✅ needs multer too
router.put(
  "/:id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  updateProduct
);

// Delete product
router.delete("/:id", deleteProduct);

export default router;
