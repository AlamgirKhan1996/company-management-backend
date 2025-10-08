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

router.post("/", validate(createTaskSchema), logActivity("CREATE_TASK", "Task", (req) => `Created task: ${req.body.name}`), createTaskController);
router.get("/", logActivity("GET_ALL_TASKS", "Task"), getTasksController);
router.get("/:id", logActivity("GET_TASK", "Task", (req) => `Fetched task: ${req.params.id}`), getTaskByIdController);
router.put("/:id", validate(updateTaskSchema), logActivity("UPDATE_TASK", "Task", (req) => `Updated task: ${req.params.id}`), updateTaskController);
router.delete("/:id", logActivity("DELETE_TASK", "Task", (req) => `Deleted task: ${req.params.id}`), deleteTaskController);

export default router;
