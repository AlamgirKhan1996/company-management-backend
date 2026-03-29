// ─── src/routes/activityRoutes.js ────────────────────────────────────────────

import express from "express";
import { getActivityLogs } from "../controllers/activityController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/activity?page=1&limit=50&entity=Task&action=TASK_CREATED
router.get("/", authenticate, getActivityLogs);

export default router;