import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";

const router = express.Router();

// GET /api/admin/stats
router.get("/stats", getDashboardStats);

export default router;
