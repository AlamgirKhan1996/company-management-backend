// ─── src/routes/dashboardRoutes.js ───────────────────────────────────────────

import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/dashboard/stats
router.get("/stats", authenticate, getDashboardStats);

export default router;
