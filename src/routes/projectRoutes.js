import express from "express";
import { createProject, getProjects } from "../controllers/projectController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",authenticate, authorize(["ADMIN", "MANAGER"]), createProject);
router.get("/",authenticate, getProjects);

export default router;
