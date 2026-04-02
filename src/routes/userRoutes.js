// ─── src/routes/userRoutes.js ────────────────────────────────────────────────

import express from "express";
import {
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// All user routes require authentication + ADMIN role minimum
router.get(
  "/",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  getUsers
);

router.get(
  "/:id",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  getUserById
);

router.patch(
  "/:id/role",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  updateUserRole
);

router.delete(
  "/:id",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  deleteUser
);

export default router;
