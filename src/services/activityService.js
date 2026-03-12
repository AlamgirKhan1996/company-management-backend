import prisma from "../utils/prismaClient.js";

export const logActivity = async (data, companyId) => {
  return await prisma.activityLog.create({
    data: {
      ...data,
      companyId,
    },
  });
};

export const getActivityLogs = async (companyId) => {
  return await prisma.activityLog.findMany({
    where: { companyId },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};
