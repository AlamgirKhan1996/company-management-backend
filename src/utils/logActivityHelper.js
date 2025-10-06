import prisma from "../utils/prismaClient.js";

// Manual logging helper for flexible use
export const logActivity = async ({ action, entity, entityId, userId, details }) => {
  try {
    if (!userId) return;

    await prisma.activityLog.create({
      data: {
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : undefined,
        performedBy: { connect: { id: userId } },
      },
    });
  } catch (error) {
    console.error("Activity log error:", error);
  }
};
