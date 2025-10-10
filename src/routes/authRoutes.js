import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { validate } from "../middleware/validateRequest.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";
import { logActivity } from "../middleware/activityLogger.js";
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Authorization APIs
 *
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
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
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *
 * /api/auth/login:
 *   post:
 *     summary: Login a user and get a token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */


router.post("/register", validate(registerSchema), logActivity("REGISTER_USER", "User", (req) => `Registered user: ${req.body.email}`), registerUser);
router.post("/login", validate(loginSchema), logActivity("LOGIN_USER", "User", (req) => `Logged in user: ${req.body.email}`), loginUser);

export default router;
