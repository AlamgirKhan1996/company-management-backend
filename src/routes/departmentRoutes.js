import express from "express";
import { createDepartment, getDepartments, deleteDepartment, updateDepartment } from "../controllers/departmentController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";
import { createDepartmentSchema } from "../validators/departmentValidator.js";
import { logActivity } from "../middleware/activityLogger.js";

const router = express.Router();

router.post("/", authenticate, authorize(["ADMIN"]), validate(createDepartmentSchema),logActivity("CREATE_DEPARTMENT", "Department", (req) => `Created department: ${req.body.name}`), createDepartment);
router.get("/", authenticate,logActivity("GET_ALL_DEPARTMENTS", "Department"), getDepartments);
router.put("/:id", authenticate, authorize (["ADMIN"]), logActivity("UPDATE_DEPARTMENT", "Department", (req) => `Updated department: ${req.body.name}`), updateDepartment);
router.delete("/:id", authenticate, authorize(["ADMIN"]), logActivity("DELETE_DEPARTMENT", "Department", (req) => `Deleted department: ${req.params.id}`), deleteDepartment);

export default router;
