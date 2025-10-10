import express from "express";
import { createDepartment, getDepartments, deleteDepartment, updateDepartment } from "../controllers/departmentController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";
import { createDepartmentSchema } from "../validators/departmentValidator.js";
import { logActivity } from "../middleware/activityLogger.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Departments
 *   description: Department management APIs
 */
/**
 * @swagger
 * tags:
 *   name: getDepartments
 *   description: Department management and retrieval
 *
 * /api/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: Successfully fetched all departments
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
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
 *                 example: IT Department
 *     responses:
 *       201:
 *         description: Department created successfully
 */

router.post("/", authenticate, authorize(["ADMIN"]), validate(createDepartmentSchema),logActivity("CREATE_DEPARTMENT", "Department", (req) => `Created department: ${req.body.name}`), createDepartment);
router.get("/", authenticate,logActivity("GET_ALL_DEPARTMENTS", "Department"), getDepartments);
router.put("/:id", authenticate, authorize (["ADMIN"]), logActivity("UPDATE_DEPARTMENT", "Department", (req) => `Updated department: ${req.body.name}`), updateDepartment);
router.delete("/:id", authenticate, authorize(["ADMIN"]), logActivity("DELETE_DEPARTMENT", "Department", (req) => `Deleted department: ${req.params.id}`), deleteDepartment);

export default router;
