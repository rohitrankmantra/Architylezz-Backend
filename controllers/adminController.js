import Product from "../models/Product.js";
import Catalogue from "../models/Catalogue.js";
import Blog from "../models/Blog.js";
import ContactForm from "../models/ContactForm.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [products, catalogues, blogs, contacts] = await Promise.all([
      Product.countDocuments(),
      Catalogue.countDocuments(),
      Blog.countDocuments(),
      ContactForm.countDocuments(),
    ]);

    res.status(200).json({
      products,
      catalogues,
      blogs,
      contacts,
    });
  } catch (err) {
    console.error("❌ Error fetching dashboard stats:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};
