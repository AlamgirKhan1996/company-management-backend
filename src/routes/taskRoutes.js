import express from "express";
import {
  createTaskController,
  getTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
} from "../controllers/taskController.js";
import { validate } from "../middleware/validateRequest.js";
import { createTaskSchema, updateTaskSchema } from "../validators/taskValidator.js";
import { logActivity } from "../middleware/activityLogger.js";


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management APIs
 *
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all tasks
 *
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               projectId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 */


router.post("/", validate(createTaskSchema), logActivity("CREATE_TASK", "Task", (req) => `Created task: ${req.body.name}`), createTaskController);
router.get("/", logActivity("GET_ALL_TASKS", "Task"), getTasksController);
router.get("/:id", logActivity("GET_TASK", "Task", (req) => `Fetched task: ${req.params.id}`), getTaskByIdController);
router.put("/:id", validate(updateTaskSchema), logActivity("UPDATE_TASK", "Task", (req) => `Updated task: ${req.params.id}`), updateTaskController);
router.delete("/:id", logActivity("DELETE_TASK", "Task", (req) => `Deleted task: ${req.params.id}`), deleteTaskController);

export default router;
