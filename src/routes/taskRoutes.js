import express from "express";
import {
  createTaskController,
  getTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
  executeTaskWithAIController,
} from "../controllers/taskController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";
import { createTaskSchema, updateTaskSchema } from "../validators/taskValidator.js";
import { logActivity } from "../middleware/activityLogger.js";

const router = express.Router();

// ─── Standard CRUD ────────────────────────────────────────────────────────────
router.post(
  "/",
  authenticate,
  validate(createTaskSchema),
  logActivity("CREATE_TASK", "Task", (req) => `Created task: ${req.body.title}`),
  createTaskController
);

// GET /api/tasks          → all tasks for company
// GET /api/tasks?projectId=xxx → tasks filtered by project
router.get("/", authenticate, getTasksController);

router.get(
  "/:id",
  authenticate,
  logActivity("GET_TASK", "Task", (req) => `Fetched task: ${req.params.id}`),
  getTaskByIdController
);

router.put(
  "/:id",
  authenticate,
  validate(updateTaskSchema),
  logActivity("UPDATE_TASK", "Task", (req) => `Updated task: ${req.params.id}`),
  updateTaskController
);

router.patch(
  "/:id",
  authenticate,
  updateTaskController
);

router.delete(
  "/:id",
  authenticate,
  logActivity("DELETE_TASK", "Task", (req) => `Deleted task: ${req.params.id}`),
  deleteTaskController
);

// ─── NEW: AI Execution ────────────────────────────────────────────────────────
// POST /api/tasks/:id/execute-ai
// body: { aiEmployeeId: "uuid" }
router.post(
  "/:id/execute-ai",
  authenticate,
  logActivity("AI_EXECUTE_TASK", "Task", (req) => `AI executed task: ${req.params.id}`),
  executeTaskWithAIController
);

export default router;
