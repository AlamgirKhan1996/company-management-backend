import express from "express";
import { getActivityLogs } from "../controllers/activityController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { logActivity } from "../middleware/activityLogger.js";

const router = express.Router();

// Only admin or manager can view all logs
router.get("/", authenticate, authorize(["ADMIN", "MANAGER"]), logActivity("GET_ACTIVITY_LOGS", "Activity"), getActivityLogs);

export default router;
