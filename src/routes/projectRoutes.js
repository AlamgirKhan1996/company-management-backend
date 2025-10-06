import express from "express";
import { createProject, getProjects, updateProject, deleteProject } from "../controllers/projectController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";
import { createProjectSchema } from "../validators/projectValidator.js";
import { activityLogger } from "../middleware/activityLogger.js";

const router = express.Router();

router.post("/", authenticate, authorize(["ADMIN", "MANAGER"]), validate(createProjectSchema), createProject, activityLogger({
  action: "CREATE_PROJECT",
  entity: "Project",
  getEntityId: (req, res) => res.locals.createdProjectId,
  getDetails: (req, res) => ({
    name: req.body.name,
    description: req.body.description,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    status: req.body.status
  })
}));
router.get("/", authenticate, getProjects);
router.put("/:id", authenticate, authorize(["ADMIN", "MANAGER"]), updateProject);
router.delete("/:id", authenticate, authorize(["ADMIN", "MANAGER"]), deleteProject)

export default router;
