import express from "express";
import {
  createUser,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";
import {
  createUserSchema,
  updateUserSchema,
} from "../validators/userValidator.js";
import { logActivity } from "../middleware/activityLogger.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

router.post(
  "/",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  validate(createUserSchema),
  logActivity("CREATE_USER", "User", (req) => `Created user: ${req.body.email}`),
  createUser
);

router.get(
  "/",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  logActivity("GET_ALL_USERS", "User"),
  getUsers
);

router.get(
  "/:id",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  logActivity("GET_USER", "User", (req) => `Fetched user: ${req.params.id}`),
  getUserById
);

router.put(
  "/:id",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  validate(updateUserSchema),
  logActivity("UPDATE_USER", "User", (req) => `Updated user: ${req.params.id}`),
  updateUser
);

router.delete(
  "/:id",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  logActivity("DELETE_USER", "User", (req) => `Deleted user: ${req.params.id}`),
  deleteUser
);

// BUG FIXED: original had `router.use(createUser)` at the bottom which applied
// the createUser controller as middleware for EVERY request on this router.

export default router;
