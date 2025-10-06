import express from "express";
import { createProject, getProjects, updateProject, deleteProject } from "../controllers/projectController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";
import { createProjectSchema } from "../validators/projectValidator.js";
const router = express.Router();

router.post("/", authenticate, authorize(["ADMIN", "MANAGER"]), validate(createProjectSchema), createProject);
router.get("/", authenticate, getProjects);
router.put("/:id", authenticate, authorize(["ADMIN", "MANAGER"]), updateProject);
router.delete("/:id", authenticate, authorize(["ADMIN", "MANAGER"]), deleteProject)

export default router;
