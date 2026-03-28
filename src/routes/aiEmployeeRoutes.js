import express from "express";
import {
  createAIEmployee,
  getAllAIEmployees,
  assignTask,
  getAgentTasks,
} from "../controllers/aiEmployeeController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// List & create AI employees
router.get("/", authenticate, getAllAIEmployees);
router.post("/", authenticate, authorize(["ADMIN", "SUPER_ADMIN"]), createAIEmployee);

// Assign task to an agent → triggers Claude → returns structured result
router.post("/:id/task", authenticate, assignTask);

// Task history for a specific agent
router.get("/:id/tasks", authenticate, getAgentTasks);

export default router;