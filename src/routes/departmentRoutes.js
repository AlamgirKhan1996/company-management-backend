import express from "express";
import { createDepartment, getDepartments, deleteDepartment, updateDepartment } from "../controllers/departmentController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";
import { createDepartmentSchema } from "../validators/departmentValidator.js";

const router = express.Router();

router.post("/", authenticate, authorize(["ADMIN"]), validate(createDepartmentSchema), createDepartment);
router.get("/", authenticate, getDepartments);
router.put("/:id", authenticate, authorize (["ADMIN"]), updateDepartment)
router.delete("/:id", authenticate, authorize(["ADMIN"]), deleteDepartment)

export default router;
