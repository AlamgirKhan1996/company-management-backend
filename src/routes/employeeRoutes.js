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
import { createEmployeeSchema, updateEmployeeSchema } from "../validators/employeeValidator.js";
import { logActivity } from "../middleware/activityLogger.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management APIs
 *
 * /api/employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of employees
 *
 *   post:
 *     summary: Create a new employee
 *     tags: [Employees]
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
 *               email:
 *                 type: string
 *               departmentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Employee created
 */


router.post("/", authenticate, validate(createEmployeeSchema), logActivity("CREATE_EMPLOYEE", "Employee", (req) => `Created employee: ${req.body.name}`), createEmployeeController);
router.get("/", authenticate, logActivity("GET_ALL_EMPLOYEES", "Employee"), getEmployeesController);
router.get("/:id", authenticate, logActivity("GET_EMPLOYEE", "Employee", (req) => `Fetched employee: ${req.params.id}`), getEmployeeByIdController);
router.put("/:id", authenticate, validate(updateEmployeeSchema), logActivity("UPDATE_EMPLOYEE", "Employee", (req) => `Updated employee: ${req.params.id}`), updateEmployeeController);
router.delete("/:id", authenticate, logActivity("DELETE_EMPLOYEE", "Employee", (req) => `Deleted employee: ${req.params.id}`), deleteEmployeeController);

export default router;
