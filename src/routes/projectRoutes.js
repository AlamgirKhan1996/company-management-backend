import express from "express";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";
import { createProjectSchema } from "../validators/projectValidator.js";
import { logActivity } from "../middleware/activityLogger.js";

const router = express.Router();

// Create Project with Activity Logging
router.post(
  "/",
  authenticate,
  authorize(["ADMIN", "MANAGER"]),
  validate(createProjectSchema),logActivity("CREATE_PROJECT", "Project", (req) => `Created project: ${req.body.name}`),
  logActivity("CREATE_PROJECT", "Project", (req) => `Created project: ${req.body.name}`),
  createProject, // ✅ controller first
);

// Other routes
router.get("/", authenticate, getProjects);
router.put("/:id", authenticate, authorize(["ADMIN", "MANAGER"]), updateProject);
router.delete("/:id", authenticate, authorize(["ADMIN", "MANAGER"]), deleteProject);

export default router;
