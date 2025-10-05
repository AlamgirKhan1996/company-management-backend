import express from "express";
import {
  createTaskController,
  getTasksController,
  getTaskByIdController,
  updateTaskController,
  deleteTaskController,
} from "../controllers/taskController.js";
import { validate } from "../middleware/validateRequest.js";
import { createTaskSchema } from "../validators/taskValidator.js";


const router = express.Router();

router.post("/", validate(createTaskSchema), createTaskController);
router.get("/", getTasksController);
router.get("/:id", getTaskByIdController);
router.put("/:id", updateTaskController);
router.delete("/:id", deleteTaskController);

export default router;
