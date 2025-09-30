import express from "express";
import { createDepartment, getDepartments } from "../controllers/departmentController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, authorize(["ADMIN"]), createDepartment);
router.get("/", authenticate, getDepartments);

export default router;
