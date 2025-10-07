import express from "express";
import { uploadFile, getFiles } from "../controllers/fileController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/upload",
  authenticate,
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  upload.single("file"),

  uploadFile,

);

router.get("/", authenticate, getFiles);

export default router;
