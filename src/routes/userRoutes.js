import express from "express";
import { createUser, getUserById, getUsers, updateUser, deleteUser } from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";
import { createUserSchema, updateUserSchema } from "../validators/userValidator.js"; 
import { logActivity } from "../middleware/activityLogger.js";


const router = express.Router();

router.post("/", authenticate, authorize(["ADMIN"]), validate(createUserSchema), logActivity("CREATE_USER", "User", (req) => `Created user: ${req.body.email}`), createUser);
router.get("/", authenticate, authorize(["ADMIN"]), logActivity("GET_ALL_USERS", "User"), getUsers);
router.get("/:id", authenticate, authorize(["ADMIN"]), logActivity("GET_USER", "User", (req) => `Fetched user: ${req.params.id}`), getUserById);
router.delete("/:id", authenticate, authorize(["ADMIN"]), logActivity("DELETE_USER", "User", (req) => `Deleted user: ${req.params.id}`), deleteUser);

router.put(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  validate(updateUserSchema),
  updateUser
);
router.use(createUser); // Apply activityLogger middleware after user creation

export default router;
