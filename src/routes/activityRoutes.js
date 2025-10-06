import express from "express";
import { getActivityLogs } from "../controllers/activityController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only admin or manager can view all logs
router.get("/", authenticate, authorize(["ADMIN", "MANAGER"]), getActivityLogs);

export default router;
