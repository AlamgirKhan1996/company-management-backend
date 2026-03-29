// ─── src/routes/notificationRoutes.js ────────────────────────────────────────

import express from "express";
import { getNotifications } from "../controllers/notificationController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/notifications
router.get("/", authenticate, getNotifications);

export default router;
