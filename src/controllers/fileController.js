import prisma from "../utils/prismaClient.js";
import * as activityService from "../services/activityService.js";

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

    await activityService.logActivity({
      action: "FILE_UPLOAD",
      entity: "File",
    })

    res.status(201).json({ message: "File uploaded successfully", file });
  } catch (err) {
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
    res.json(files);
  } catch (err) {
    next(err);
  }
};
