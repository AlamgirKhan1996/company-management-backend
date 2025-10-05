import express from "express";
import { createUser, getUsers } from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";
import { createUserSchema } from "../validators/userValidator.js"; 

const router = express.Router();

router.post("/", authenticate, authorize(["ADMIN"]), validate(createUserSchema), createUser);
router.get("/", authenticate, authorize(["ADMIN"]), getUsers);

export default router;
