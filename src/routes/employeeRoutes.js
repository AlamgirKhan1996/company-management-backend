import express from "express";
import {
  createEmployeeController,
  getEmployeesController,
  getEmployeeByIdController,
  updateEmployeeController,
  deleteEmployeeController,
} from "../controllers/employeeController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";
import { createEmployeeSchema } from "../validators/employeeValidator.js";

const router = express.Router();

router.post("/", authenticate, validate(createEmployeeSchema), createEmployeeController);
router.get("/", authenticate, getEmployeesController);
router.get("/:id", authenticate, getEmployeeByIdController);
router.put("/:id", authenticate, updateEmployeeController);
router.delete("/:id", authenticate, deleteEmployeeController);

export default router;
