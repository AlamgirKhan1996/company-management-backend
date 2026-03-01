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

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management APIs
 *
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all projects
 *
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               departmentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created successfully
 */


// Create Project with Activity Logging
router.post(
  "/projects",
  authenticate,
  authorize(["ADMIN", "MANAGER"]),
  validate(createProjectSchema),
  logActivity("CREATE_PROJECT", "Project", (req) => `Created project: ${req.body.name}`),
  createProject, // ✅ controller first
);

// Other routes
router.get("/", authenticate, getProjects);
router.put("/:id", authenticate, authorize(["ADMIN", "MANAGER"]), updateProject);
router.delete("/:id", authenticate, authorize(["ADMIN", "MANAGER"]), deleteProject);

export default router;
