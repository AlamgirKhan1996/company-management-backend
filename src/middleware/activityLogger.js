import prisma from "../utils/prismaClient.js";

// Middleware factory: pass action, entity, and optionally a function to get dynamic entityId/details
export const activityLogger = ({ action, entity, getEntityId, getDetails }) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id; // from your auth middleware
      if (!userId) return next();

      await prisma.activityLog.create({
        data: {
          action,
          entity,
          entityId: getEntityId ? getEntityId(req, res) : undefined,
          details: getDetails ? JSON.stringify(getDetails(req, res)) : undefined,
          performedBy: { connect: { id: userId } },
        },
      });
    } catch (error) {
      console.error("Activity log error:", error);
    }

    next();
  };
};
