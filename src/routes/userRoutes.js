import express from "express";
import { createUser, getUsers, updateUser, deleteUser } from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateRequest.js";
import { createUserSchema, updateUserSchema } from "../validators/userValidator.js"; 
import { activityLogger } from "../middleware/activityLogger.js";


const router = express.Router();

router.post("/", authenticate, authorize(["ADMIN"]), validate(createUserSchema), createUser);
router.get("/", authenticate, authorize(["ADMIN"]), getUsers);
router.delete("/:id", authenticate, authorize(["ADMIN"]), deleteUser);

router.put(
  "/:id",
  authenticate,
  authorize(["ADMIN"]),
  validate(updateUserSchema),
  updateUser
);
router.use(createUser, activityLogger({
    action: "CREATE_USER",
    entity: "User",
    getEntityId: (req) => res.locals.createdUserId,
    getDetails: (req) => ({
      email: req.body.email,
      role: req.body.role
    })
})); // Apply activityLogger middleware after user creation

export default router;
