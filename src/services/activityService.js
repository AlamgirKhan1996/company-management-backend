import prisma from "../utils/prismaClient.js";

export const logActivity = async (data) => {
  return await prisma.activityLog.create({ data });
};

export const getActivityLogs = async () => {
  return await prisma.activityLog.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};
