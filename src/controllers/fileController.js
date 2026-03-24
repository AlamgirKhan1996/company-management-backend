import prisma from "../utils/prismaClient.js";
import * as activityService from "../services/activityService.js";
import logger from "../utils/logger.js";
import { Cache } from "../utils/cache.js";
import { CacheKeys } from "../utils/cacheKeys.js";

// BUG FIXED: companyId was never set on File records, breaking multi-tenant queries.
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { projectId } = req.body;
    const companyId = req.companyId || req.user.companyId;

    const file = await prisma.file.create({
      data: {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedBy: { connect: { id: req.user.id } },
        company: { connect: { id: companyId } },          // ← was missing
        project: projectId ? { connect: { id: projectId } } : undefined,
      },
    });

    await activityService.logActivity(
      {
        action: "FILE_UPLOADED",
        entity: "File",
        entityId: file.id,
        userId: req.user.id,
        details: JSON.stringify({
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          projectId: projectId || null,
        }),
      },
      companyId
    );

    logger.info(
      `✅ File uploaded: ${file.filename} ID: ${file.id} by user ${req.user.id}`
    );
    await Cache.del(CacheKeys.files.all);
    res.status(201).json({ message: "File uploaded successfully", file });
  } catch (err) {
    logger.error(`❌ Error uploading file: ${err.message}`);
    next(err);
  }
};

export const getFiles = async (req, res, next) => {
  try {
    const companyId = req.companyId || req.user.companyId;

    const files = await prisma.file.findMany({
      where: { companyId },           // ← scoped to company
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    logger.info(`Get Files: ${files.length} files for company ${companyId}`);
    res.json(files);
  } catch (err) {
    logger.error(`❌ Error getting files: ${err.message}`);
    next(err);
  }
};
