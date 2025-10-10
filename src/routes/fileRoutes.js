import express from "express";
import { uploadFile, getFiles } from "../controllers/fileController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { logActivity } from "../middleware/activityLogger.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File upload and management APIs
 *
 * /api/files/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *
 * /api/files:
 *   get:
 *     summary: Get list of uploaded files
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of files
 */


router.post(
  "/upload",
  authenticate,
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  upload.single("file"),logActivity("UPLOAD_FILE", "File", (req) => `Uploaded file: ${req.file.originalname}`),
  uploadFile
);

router.get("/", authenticate, getFiles);

export default router;
