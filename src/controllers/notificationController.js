// ─── src/controllers/notificationController.js ───────────────────────────────

import prisma from "../utils/prismaClient.js";
import logger from "../utils/logger.js";

export const getNotifications = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const now = new Date();
    const notifications = [];

    const [overdueTasks, recentAITasks, recentActivity] = await Promise.all([
      // Overdue tasks — not done + past due date
      prisma.task.findMany({
        where: {
          companyId,
          status: { not: "DONE" },
          dueDate: { lt: now },
        },
        select: {
          id: true, title: true, dueDate: true,
          project: { select: { name: true } },
          employee: { select: { name: true } },
        },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),

      // AI tasks completed in last 24h
      prisma.aITask.findMany({
        where: {
          companyId,
          status: "COMPLETED",
          executedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        include: {
          aiEmployee: { select: { name: true, role: true } },
        },
        orderBy: { executedAt: "desc" },
        take: 5,
      }),

      // Recent activity in last 2h
      prisma.activityLog.findMany({
        where: {
          companyId,
          createdAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    // ─── Build notification objects ───────────────────────────────────────
    overdueTasks.forEach((task) => {
      const daysOverdue = Math.floor(
        (now.getTime() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      notifications.push({
        id: `overdue-${task.id}`,
        type: "OVERDUE",
        severity: daysOverdue > 3 ? "critical" : "warning",
        title: "Task Overdue",
        message: `"${task.title}" is ${daysOverdue} day${daysOverdue !== 1 ? "s" : ""} overdue`,
        meta: {
          taskId: task.id,
          project: task.project?.name,
          assignee: task.employee?.name,
        },
        createdAt: task.dueDate,
      });
    });

    recentAITasks.forEach((aiTask) => {
      notifications.push({
        id: `ai-${aiTask.id}`,
        type: "AI_COMPLETED",
        severity: "info",
        title: "AI Task Completed",
        message: `${aiTask.aiEmployee?.name} completed "${aiTask.title}"`,
        meta: { aiTaskId: aiTask.id },
        createdAt: aiTask.executedAt,
      });
    });

    recentActivity.forEach((log) => {
      const actor = log.user?.name || log.user?.email || "System";
      notifications.push({
        id: `activity-${log.id}`,
        type: "ACTIVITY",
        severity: "default",
        title: log.action.replace(/_/g, " "),
        message: `${actor} — ${log.entity}`,
        meta: { entity: log.entity, entityId: log.entityId },
        createdAt: log.createdAt,
      });
    });

    // Sort by date desc, take top 20
    notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const unreadCount = notifications.filter(
      (n) => n.type === "OVERDUE" || n.type === "AI_COMPLETED"
    ).length;

    res.status(200).json({
      notifications: notifications.slice(0, 20),
      unreadCount,
    });
  } catch (err) {
    logger.error(`❌ Notifications error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
