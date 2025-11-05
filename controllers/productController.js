import Product from "../models/Product.js";
import fs from "fs";
import path from "path";

/* ----------------------------------
   Helper: Delete local file safely
---------------------------------- */
const deleteLocalFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error deleting local file:", error);
  }
};

/* ----------------------------------
   Helper: Get Base URL
---------------------------------- */
const getBaseUrl = (req) => {
  return process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
};

/* ----------------------------------
   @desc   Create a new product
   @route  POST /api/products
---------------------------------- */
export const createProduct = async (req, res) => {
  try {
    const BASE_URL = getBaseUrl(req);

    const {
      title,
      description,
      metaTitle,
      metaDescription,
      size,
      category,
      finish,
      actualSize,
      filterSize,
      materialType,
      application,
      brand,
      quality,
      coverageArea,
      pcsPerBox,
    } = req.body;

    if (!title || !description || !size || !category || !finish) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (!req.files?.thumbnail || req.files.thumbnail.length === 0) {
      return res.status(400).json({ message: "Thumbnail is required" });
    }

    const thumbnailFile = req.files.thumbnail[0];
    const thumbnail = {
      url: `${BASE_URL}/uploads/products/${thumbnailFile.filename}`,
      filename: thumbnailFile.filename,
    };

    if (!req.files?.images || req.files.images.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one product image is required" });
    }

    const images = req.files.images.map((file) => ({
      url: `${BASE_URL}/uploads/products/${file.filename}`,
      filename: file.filename,
    }));

    const newProduct = new Product({
      title,
      description,
      metaTitle: metaTitle || "",
      metaDescription: metaDescription || "",
      thumbnail,
      images,
      size: [].concat(size),
      category,
      finish: [].concat(finish),
      actualSize,
      filterSize,
      materialType,
      application: application ? [].concat(application) : [],
      brand,
      quality,
      coverageArea,
      pcsPerBox,
    });

    const savedProduct = await newProduct.save();
    res
      .status(201)
      .json({ message: "✅ Product created successfully", product: savedProduct });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ----------------------------------
   @desc   Get all products
   @route  GET /api/products
---------------------------------- */
export const getProducts = async (req, res) => {
  try {
    const BASE_URL = getBaseUrl(req);
    const products = await Product.find().sort({ createdAt: -1 });

    const updatedProducts = products.map((product) => ({
      ...product._doc,
      thumbnail: product.thumbnail
        ? {
            ...product.thumbnail,
            url: product.thumbnail.url.startsWith("http")
              ? product.thumbnail.url
              : `${BASE_URL}${product.thumbnail.url}`,
          }
        : null,
      images: Array.isArray(product.images)
        ? product.images.map((img) => ({
            ...img,
            url: img.url.startsWith("http")
              ? img.url
              : `${BASE_URL}${img.url}`,
          }))
        : [],
    }));

    res.status(200).json(updatedProducts);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ----------------------------------
   @desc   Get single product by ID
   @route  GET /api/products/:id
---------------------------------- */
export const getProductById = async (req, res) => {
  try {
    const BASE_URL = getBaseUrl(req);
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const updatedProduct = {
      ...product._doc,
      thumbnail: product.thumbnail
        ? {
            ...product.thumbnail,
            url: product.thumbnail.url.startsWith("http")
              ? product.thumbnail.url
              : `${BASE_URL}${product.thumbnail.url}`,
          }
        : null,
      images: Array.isArray(product.images)
        ? product.images.map((img) => ({
            ...img,
            url: img.url.startsWith("http")
              ? img.url
              : `${BASE_URL}${img.url}`,
          }))
        : [],
    };

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ----------------------------------
   @desc   Update product
   @route  PUT /api/products/:id
---------------------------------- */
export const updateProduct = async (req, res) => {
  try {
    const BASE_URL = getBaseUrl(req);
    const {
      title,
      description,
      metaTitle,
      metaDescription,
      size,
      category,
      finish,
      actualSize,
      filterSize,
      materialType,
      application,
      brand,
      quality,
      coverageArea,
      pcsPerBox,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Update fields
    if (title) product.title = title;
    if (description) product.description = description;
    if (metaTitle) product.metaTitle = metaTitle;
    if (metaDescription) product.metaDescription = metaDescription;
    if (size) product.size = [].concat(size);
    if (category) product.category = category;
    if (finish) product.finish = [].concat(finish);
    if (actualSize) product.actualSize = actualSize;
    if (filterSize) product.filterSize = filterSize;
    if (materialType) product.materialType = materialType;
    if (application) product.application = [].concat(application);
    if (brand) product.brand = brand;
    if (quality) product.quality = quality;
    if (coverageArea) product.coverageArea = coverageArea;
    if (pcsPerBox) product.pcsPerBox = pcsPerBox;

    // Replace thumbnail if new one uploaded
    if (req.files?.thumbnail && req.files.thumbnail.length > 0) {
      if (product.thumbnail?.filename) {
        deleteLocalFile(
          path.join(process.cwd(), "uploads/products", product.thumbnail.filename)
        );
      }
      const thumbnailFile = req.files.thumbnail[0];
      product.thumbnail = {
        url: `${BASE_URL}/uploads/products/${thumbnailFile.filename}`,
        filename: thumbnailFile.filename,
      };
    }

    // Replace images if new ones uploaded
    if (req.files?.images && req.files.images.length > 0) {
      if (Array.isArray(product.images) && product.images.length > 0) {
        for (const img of product.images) {
          if (img.filename) {
            deleteLocalFile(
              path.join(process.cwd(), "uploads/products", img.filename)
            );
          }
        }
      }
      product.images = req.files.images.map((file) => ({
        url: `${BASE_URL}/uploads/products/${file.filename}`,
        filename: file.filename,
      }));
    }

    const updatedProduct = await product.save();
    res
      .status(200)
      .json({ message: "✅ Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ----------------------------------
   @desc   Delete product
   @route  DELETE /api/products/:id
---------------------------------- */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete thumbnail
    if (product.thumbnail?.filename) {
      deleteLocalFile(
        path.join(process.cwd(), "uploads/products", product.thumbnail.filename)
      );
    }

    // Delete all images
    if (Array.isArray(product.images) && product.images.length > 0) {
      for (const img of product.images) {
        if (img.filename) {
          deleteLocalFile(
            path.join(process.cwd(), "uploads/products", img.filename)
          );
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "🗑️ Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
