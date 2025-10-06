import express from "express";
import { uploadFile, getFiles } from "../controllers/fileController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { activityLogger } from "../middleware/activityLogger.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/upload",
  authenticate,
  authorize(["ADMIN", "MANAGER", "EMPLOYEE"]),
  upload.single("file"),

  uploadFile,
  activityLogger({
    action: "UPLOAD_FILE",
    entity: "File",
    getEntityId: (req, res) => res.locals.fileId,
    getDetails: (req, res) => ({
      filename: req.file.originalname,
      projectId: req.body.projectId || null,
    }),
  })
);

router.get("/", authenticate, getFiles);

export default router;
