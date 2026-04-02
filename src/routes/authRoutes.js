import express from "express";
import { registerUser, loginUser, registerCompany } from "../controllers/authController.js";
import { validate } from "../middleware/validateRequest.js";
import { registerSchema, loginSchema, registerCompanySchema } from "../validators/authValidator.js";
import { inviteSchema } from "../validators/authValidator.js";
import { logActivity } from "../middleware/activityLogger.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { getMe } from "../controllers/authController.js";
import { sendInvite } from "../controllers/inviteController.js";
import { changePassword } from "../controllers/authController.js";
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
router.post(
  "/register-company",
  validate(registerCompanySchema),
  logActivity(
    "REGISTER_COMPANY",
    "Company",
    (req) => `Registered company: ${req.body.companyEmail} with admin: ${req.body.adminEmail}`
  ),
  registerCompany
);
router.post("/change-password", authenticate, logActivity("CHANGE_PASSWORD", "User", (req) => `Changed password for user: ${req.user.email}`), changePassword);

router.post("/invite", authenticate, authorize(["SUPER_ADMIN", "ADMIN"]), validate(inviteSchema), sendInvite);
router.get("/me", authenticate, logActivity("GET_ME", "User", (req) => `Fetched profile for user: ${req.user.email}`), getMe);


export default router;
