import express from "express";
import { createUser, getUserById, getUsers, updateUser, deleteUser } from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";
import { createUserSchema, updateUserSchema } from "../validators/userValidator.js"; 


const router = express.Router();

router.post("/", authenticate, authorize(["ADMIN"]), validate(createUserSchema), createUser);
router.get("/", authenticate, authorize(["ADMIN"]), getUsers);
router.get("/:id", authenticate, authorize(["ADMIN"]), getUserById);
router.delete("/:id", authenticate, authorize(["ADMIN"]), deleteUser);

router.put(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  validate(updateUserSchema),
  updateUser
);
router.use(createUser); // Apply activityLogger middleware after user creation

export default router;
