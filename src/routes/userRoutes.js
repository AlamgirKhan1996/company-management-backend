import express from "express";
import { createUser, getUsers } from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",authenticate, authorize(["ADMIN"]), createUser);
router.get("/",authenticate, authorize(["ADMIN"]), getUsers);

export default router;
