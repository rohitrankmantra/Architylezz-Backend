import express from "express";
import {
  getHomeMeta,
  createHomeMeta,
  updateHomeMeta,
  deleteHomeMeta,
} from "../controllers/homeMetaController.js";

const router = express.Router();

// 🔵 Get Home Meta (single)
router.get("/", getHomeMeta);

// 🟢 Create Home Meta (only if not exists)
router.post("/", createHomeMeta);

// 🟡 Update Home Meta
router.put("/", updateHomeMeta);

// 🔴 Delete Home Meta
router.delete("/", deleteHomeMeta);

export default router;
