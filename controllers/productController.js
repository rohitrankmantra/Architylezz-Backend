// controllers/productController.js
import Product from "../models/Product.js";
import cloudinary from "../utils/cloudinary.js";

/* ----------------------------------
   Helper: Upload buffer → Cloudinary
---------------------------------- */
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
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

/* ----------------------------------
   @desc   Create a new product
   @route  POST /api/products
---------------------------------- */
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
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
    const thumbnail = await uploadToCloudinary(
      thumbnailFile.buffer,
      "products/thumbnails"
    );

    if (!req.files?.images || req.files.images.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one product image is required" });
    }
    const images = await Promise.all(
      req.files.images.map((file) =>
        uploadToCloudinary(file.buffer, "products/images")
      )
    );

    const newProduct = new Product({
      title,
      description,
      thumbnail,
      images,
      size: [].concat(size), // ✅ ensure array
      category,
      finish: [].concat(finish), // ✅ ensure array
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
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
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
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
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
    const {
      title,
      description,
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

    // 🔹 Update text fields
    if (title) product.title = title;
    if (description) product.description = description;
    if (size) product.size = [].concat(size); // ✅ ensure array
    if (category) product.category = category;
    if (finish) product.finish = [].concat(finish); // ✅ ensure array
    if (actualSize) product.actualSize = actualSize;
    if (filterSize) product.filterSize = filterSize;
    if (materialType) product.materialType = materialType;
    if (application) product.application = [].concat(application);
    if (brand) product.brand = brand;
    if (quality) product.quality = quality;
    if (coverageArea) product.coverageArea = coverageArea;
    if (pcsPerBox) product.pcsPerBox = pcsPerBox;

    // 🔹 Replace thumbnail if new one uploaded
    if (req.files?.thumbnail && req.files.thumbnail.length > 0) {
      if (product.thumbnail?.public_id) {
        await cloudinary.uploader.destroy(product.thumbnail.public_id);
      }
      const thumbnailFile = req.files.thumbnail[0];
      product.thumbnail = await uploadToCloudinary(
        thumbnailFile.buffer,
        "products/thumbnails"
      );
    }

    // 🔹 Replace images if new ones uploaded
    if (req.files?.images && req.files.images.length > 0) {
      if (Array.isArray(product.images) && product.images.length > 0) {
        for (const img of product.images) {
          if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
        }
      }
      product.images = await Promise.all(
        req.files.images.map((file) =>
          uploadToCloudinary(file.buffer, "products/images")
        )
      );
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

    // Delete images from Cloudinary
    if (product.thumbnail && product.thumbnail.public_id) {
      await cloudinary.uploader.destroy(product.thumbnail.public_id);
    }
    if (Array.isArray(product.images) && product.images.length > 0) {
      for (const img of product.images) {
        if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
      }
    }

    // Delete from DB
    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "🗑️ Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
