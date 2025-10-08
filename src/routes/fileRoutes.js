import express from "express";
import { uploadFile, getFiles } from "../controllers/fileController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { logActivity } from "../middleware/activityLogger.js";

const router = express.Router();

router.post(
  "/upload",
  authenticate,
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  upload.single("file"),logActivity("UPLOAD_FILE", "File", (req) => `Uploaded file: ${req.file.originalname}`),
  uploadFile
);

router.get("/", authenticate, getFiles);

export default router;
