import express from "express";
import {
  createEmployeeController,
  getEmployeesController,
  getEmployeeByIdController,
  updateEmployeeController,
  deleteEmployeeController,
} from "../controllers/employeeController.js";

const router = express.Router();

router.post("/", createEmployeeController);
router.get("/", getEmployeesController);
router.get("/:id", getEmployeeByIdController);
router.put("/:id", updateEmployeeController);
router.delete("/:id", deleteEmployeeController);

export default router;
