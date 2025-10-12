import prisma from "../utils/prismaClient.js";
import * as activityService from "../services/activityService.js";
import logger from "../utils/logger.js";

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const { projectId } = req.body;

    const file = await prisma.file.create({
      data: {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        uploadedBy: { connect: { id: req.user.id } },
        project: projectId ? { connect: { id: projectId } } : undefined,
      },
    });
    logger.info(`✅ File uploaded successfully: ${file.filename} ID: ${file.id} by user ${req.user.id}`);
    await activityService.logActivity({
      action: "FILE_UPLOADED",
      entity: "File",
      entityId: file.id,
      userId: req.user.id,
      details: JSON.stringify({
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        projectId: projectId,
      }),
    });
    logger.info(`✅ File uploaded successfully: ${file.filename} ID: ${file.id} by user ${req.user.id}`);

    res.status(201).json({ message: "File uploaded successfully", file });
  } catch (err) {
    logger.error(`❌ Error uploading file: ${err.message}`);
    next(err);
  }
};

export const getFiles = async (req, res, next) => {
  try {
    const files = await prisma.file.findMany({
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
      await activityService.logActivity({
      action: "GET_ALL_FILES",
      entity: "File",
      userId: req.user.id,
      details: JSON.stringify({
        fileCount: files.length
      })
    });
    res.json(files);
  } catch (err) {
    next(err);
  }
};
