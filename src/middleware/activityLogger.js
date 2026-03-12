import prisma from "../utils/prismaClient.js";

// Universal Activity Logger (company-aware)
export const logActivity = (action, entityType, getDetails) => {
  return async (req, res, next) => {
    // Wait until response is sent
    res.on("finish", async () => {
      try {
        const performedById = req.user?.id || null;
        const companyId = req.companyId || req.user?.companyId || null;
        let details = `${req.user?.email || "Unknown"} performed ${action} on ${entityType}`;

        // If user provided a details function (optional)
        if (typeof getDetails === "function") {
          const customDetails = await getDetails(req, res);
          if (customDetails) details = customDetails;
        }

        await prisma.activityLog.create({
          data: {
            action,
            entity: entityType,
            entityId: req.params.id || null,
            performedById,
            details,
            companyId,
          },
        });
      } catch (err) {
        console.error("Activity log failed:", err.message);
      }
    });

    next();
  };
};
