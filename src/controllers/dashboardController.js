// ─── src/controllers/dashboardController.js ──────────────────────────────────

import prisma from "../utils/prismaClient.js";
import logger from "../utils/logger.js";
import { Cache } from "../utils/cache.js";

export const getDashboardStats = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const cacheKey = `dashboard:stats:${companyId}`;

    // Check cache first (30s TTL — short so stats feel live)
    const cached = await Cache.get(cacheKey);
    if (cached) {
      logger.info("📦 Dashboard stats from cache");
      return res.status(200).json(JSON.parse(cached));
    }

    const now = new Date();

    // ─── Run ALL queries in parallel for speed ────────────────────────────
    const [
      departmentsCount,
      employeesCount,
      projectsCount,
      aiEmployeesCount,
      aiTasksExecuted,
      tasksAll,
      recentProjects,
      recentEmployees,
    ] = await Promise.all([
      // Counts
      prisma.department.count({ where: { companyId } }),
      prisma.employee.count({ where: { companyId } }),
      prisma.project.count({ where: { companyId } }),
      prisma.aIEmployee.count({ where: { companyId, isActive: true } }),
      prisma.aITask.count({ where: { companyId, status: "COMPLETED" } }),

      // All tasks for breakdowns
      prisma.task.findMany({
        where: { companyId },
        select: {
          id: true,
          status: true,
          dueDate: true,
          createdAt: true,
          project: { select: { name: true } },
        },
      }),

      // Recent projects (last 5)
      prisma.project.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          _count: { select: { tasks: true } },
        },
      }),

      // Recent employees (last 5)
      prisma.employee.findMany({
        where: { companyId },
        orderBy: { id: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          role: true,
          department: { select: { name: true } },
        },
      }),
    ]);

    // ─── Task breakdowns ──────────────────────────────────────────────────
    const tasksTotal = tasksAll.length;
    const tasksTodo = tasksAll.filter((t) => t.status === "TODO").length;
    const tasksInProgress = tasksAll.filter((t) => t.status === "IN_PROGRESS").length;
    const tasksDone = tasksAll.filter((t) => t.status === "DONE").length;
    const tasksAIExecuted = 0; // Placeholder - implement when AI execution tracking exists

    const tasksOverdue = tasksAll.filter((t) => {
      if (!t.dueDate || t.status === "DONE") return false;
      return new Date(t.dueDate) < now;
    }).length;

    const tasksHighPriority = 0; // Placeholder - implement when priority field exists

    // ─── Task trend (last 7 days) ─────────────────────────────────────────
    const taskTrend = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const created = tasksAll.filter((t) => {
        const d = new Date(t.createdAt);
        return d >= day && d < nextDay;
      }).length;

      const completed = tasksAll.filter((t) => {
        const d = new Date(t.createdAt);
        return d >= day && d < nextDay && t.status === "DONE";
      }).length;

      taskTrend.push({
        label: day.toLocaleDateString("en-US", { weekday: "short" }),
        created,
        completed,
      });
    }

    // ─── Completion rate ──────────────────────────────────────────────────
    const completionRate =
      tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

    const stats = {
      // Core counts
      departments: departmentsCount,
      employees: employeesCount,
      projects: projectsCount,
      aiEmployees: aiEmployeesCount,
      aiTasksExecuted,

      // Task breakdown
      tasks: {
        total: tasksTotal,
        todo: tasksTodo,
        inProgress: tasksInProgress,
        done: tasksDone,
        overdue: tasksOverdue,
        highPriority: tasksHighPriority,
        aiExecuted: tasksAIExecuted,
        completionRate,
      },

      // Trend data for chart
      taskTrend,

      // Recent activity lists
      recentProjects,
      recentEmployees,

      generatedAt: new Date().toISOString(),
    };

    await Cache.set(cacheKey, JSON.stringify(stats), 30);
    logger.info(`📊 Dashboard stats generated for company ${companyId}`);
    res.status(200).json(stats);
  } catch (err) {
    logger.error(`❌ Dashboard stats error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
