// ─── src/controllers/activityController.js ───────────────────────────────────

import prisma from "../utils/prismaClient.js";
import logger from "../utils/logger.js";
import { Cache } from "../utils/cache.js";
import * as activityService from "../services/activityService.js";

export const getActivityLogs = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const { page = 1, limit = 50, entity, action, userId } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build dynamic where clause
    const where = { companyId };
    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (userId) where.userId = userId;

    const cacheKey = `activity:${companyId}:${page}:${limit}:${entity || ""}:${action || ""}`;
    const cached = await Cache.get(cacheKey);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.activityLog.count({ where }),
    ]);

    const result = {
      logs,
      pagination: {
        total,
        page: parseInt(page),
        limit: take,
        pages: Math.ceil(total / take),
      },
    };

    await Cache.set(cacheKey, JSON.stringify(result), 30);
    logger.info(`📋 Activity logs fetched: ${logs.length} for company ${companyId}`);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`❌ Activity log error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};