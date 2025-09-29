// server.js (or index.js)
import dotenv from "dotenv";
dotenv.config({ override: true });

import express from "express";
import cors from "cors";
import { connectDB } from "./lib/db.js"; 
import productRoutes from "./routes/productRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import catalogueRoutes from "./routes/catalogueRoutes.js";
import contactFormRoutes from "./routes/contactFormRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

const app = express();

// ✅ Middleware
app.use(express.json());

// ✅ Allowed origins (comma-separated in .env)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000","https://architylez.vercel.app"]; // fallback for dev

// ✅ CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`❌ Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Health check
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

// ✅ Routes
app.use("/api/products", productRoutes);
app.use("/api/catalogues", catalogueRoutes);  
app.use("/api/projects", projectRoutes);

app.use("/api/blogs", blogRoutes);
app.use("/api/contact-forms", contactFormRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Start Server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`✅ Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB connection failed", err.message);
    process.exit(1);
  });
