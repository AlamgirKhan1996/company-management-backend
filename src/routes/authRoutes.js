import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { validate } from "../middleware/validateRequest.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";
import { logActivity } from "../middleware/activityLogger.js";
const router = express.Router();

router.post("/register", validate(registerSchema), logActivity("REGISTER_USER", "User", (req) => `Registered user: ${req.body.email}`), registerUser);
router.post("/login", validate(loginSchema), logActivity("LOGIN_USER", "User", (req) => `Logged in user: ${req.body.email}`), loginUser);

export default router;
