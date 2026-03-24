import prisma from "../utils/prismaClient.js";

// BUG FIXED: all controllers called logActivity({ action, entity, ... })
// without a second companyId argument. The service silently stored null companyId
// so logs were invisible per-company. Now companyId is read from inside data too.
export const logActivity = async (data, companyId) => {
  try {
    const resolvedCompanyId = companyId || data.companyId || null;
    const { companyId: _skip, ...rest } = data; // avoid sending it twice

    await prisma.activityLog.create({
      data: {
        ...rest,
        companyId: resolvedCompanyId,
      },
    });
  } catch (err) {
    // Activity logging must NEVER crash the main request
    console.error("Activity log failed:", err.message);
  }
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
