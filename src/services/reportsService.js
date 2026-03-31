// ─── src/services/reportsService.js ───────────────────────────────────────────

import prisma from "../utils/prismaClient.js";

// ─── Internal Helpers ─────────────────────────────────────────────────────────

const getDateRange = (startDate, endDate) => {
  const now = new Date();
  const start = startDate && !isNaN(new Date(startDate))
    ? new Date(startDate)
    : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate && !isNaN(new Date(endDate)) ? new Date(endDate) : now;
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const isOverdue = (dueDate, status) =>
  dueDate && status !== "DONE" && new Date(dueDate) < new Date();

const completionRate = (completed, total) =>
  total > 0 ? Math.round((completed / total) * 100) : 0;

const productivityScore = (total, completed, overdue) => {
  if (total === 0) return 0;
  const compRate = completed / total;
  const overdueRate = overdue / total;
  return Math.max(0, Math.min(100, Math.round(compRate * (1 - 0.5 * overdueRate) * 100)));
};

/**
 * Builds a daily bucket array over [start, end].
 * items       – array of records
 * getDate     – fn(item) => Date
 * extraBuckets – optional map: { fieldName: fn(item, bucketStart, bucketEnd) => number }
 */
const buildDailyTrend = (items, getDate, start, end, extraBuckets = {}) => {
  const buckets = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(23, 59, 59, 999);

  // Hard cap at 90 daily buckets for performance
  const diffDays = Math.ceil((endDay - cursor) / (1000 * 60 * 60 * 24));
  const useWeekly = diffDays > 90;

  while (cursor <= endDay) {
    const bucketStart = new Date(cursor);
    const bucketEnd = new Date(cursor);
    if (useWeekly) {
      bucketEnd.setDate(bucketEnd.getDate() + 6);
      bucketEnd.setHours(23, 59, 59, 999);
    } else {
      bucketEnd.setHours(23, 59, 59, 999);
    }

    const inRange = items.filter((item) => {
      const d = getDate(item);
      return d >= bucketStart && d <= bucketEnd;
    });

    const bucket = {
      date: bucketStart.toISOString().slice(0, 10),
      label: bucketStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: inRange.length,
    };

    for (const [key, fn] of Object.entries(extraBuckets)) {
      bucket[key] = fn(inRange, bucketStart, bucketEnd);
    }

    buckets.push(bucket);
    cursor.setDate(cursor.getDate() + (useWeekly ? 7 : 1));
  }

  return { buckets, granularity: useWeekly ? "weekly" : "daily" };
};

// ─── 1. Overview / KPI Report ─────────────────────────────────────────────────

export const getOverviewReport = async (companyId, { startDate, endDate } = {}) => {
  const { start, end } = getDateRange(startDate, endDate);
  const now = new Date();
  const dateFilter = { gte: start, lte: end };

  const [
    totalEmployees,
    newEmployees,
    totalProjects,
    activeProjects,
    completedProjects,
    onHoldProjects,
    totalDepartments,
    totalAIEmployees,
    activeAIEmployees,
    allTasksInPeriod,
    allAITasksInPeriod,
    recentActivity,
    totalUsers,
    pendingInvites,
  ] = await Promise.all([
    prisma.employee.count({ where: { companyId } }),
    prisma.employee.count({ where: { companyId, createdAt: dateFilter } }),
    prisma.project.count({ where: { companyId } }),
    prisma.project.count({ where: { companyId, status: "IN_PROGRESS" } }),
    prisma.project.count({ where: { companyId, status: "COMPLETED" } }),
    prisma.project.count({ where: { companyId, status: "ON_HOLD" } }),
    prisma.department.count({ where: { companyId } }),
    prisma.aIEmployee.count({ where: { companyId } }),
    prisma.aIEmployee.count({ where: { companyId, isActive: true } }),

    prisma.task.findMany({
      where: { companyId, createdAt: dateFilter },
      select: { id: true, status: true, dueDate: true, createdAt: true, updatedAt: true },
    }),

    prisma.aITask.findMany({
      where: { companyId, createdAt: dateFilter },
      select: { id: true, status: true, createdAt: true },
    }),

    prisma.activityLog.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        action: true,
        entity: true,
        details: true,
        createdAt: true,
        performedBy: { select: { name: true, email: true } },
      },
    }),

    prisma.user.count({ where: { companyId } }),
    prisma.invite.count({ where: { companyId, status: "PENDING" } }),
  ]);

  const totalTasks = allTasksInPeriod.length;
  const completedTasks = allTasksInPeriod.filter((t) => t.status === "DONE").length;
  const inProgressTasks = allTasksInPeriod.filter((t) => t.status === "IN_PROGRESS").length;
  const todoTasks = allTasksInPeriod.filter((t) => t.status === "TODO").length;
  const overdueTasks = allTasksInPeriod.filter((t) => isOverdue(t.dueDate, t.status)).length;
  const taskCompletionRate = completionRate(completedTasks, totalTasks);

  const totalAITasks = allAITasksInPeriod.length;
  const completedAITasks = allAITasksInPeriod.filter((t) => t.status === "COMPLETED").length;
  const failedAITasks = allAITasksInPeriod.filter((t) => t.status === "FAILED").length;

  const { buckets: trend, granularity } = buildDailyTrend(
    allTasksInPeriod,
    (t) => new Date(t.createdAt),
    start,
    end,
    {
      completed: (items) => items.filter((t) => t.status === "DONE").length,
    }
  );

  return {
    kpis: {
      totalEmployees,
      newEmployees,
      totalUsers,
      pendingInvites,
      totalProjects,
      activeProjects,
      completedProjects,
      onHoldProjects,
      totalDepartments,
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      taskCompletionRate,
    },
    ai: {
      totalAIEmployees,
      activeAIEmployees,
      totalAITasks,
      completedAITasks,
      failedAITasks,
      aiCompletionRate: completionRate(completedAITasks, totalAITasks),
    },
    trend: { data: trend, granularity },
    recentActivity,
  };
};

// ─── 2. Projects Analytics Report ────────────────────────────────────────────

export const getProjectsReport = async (companyId, { startDate, endDate, departmentId } = {}) => {
  const { start, end } = getDateRange(startDate, endDate);
  const now = new Date();

  const where = { companyId, createdAt: { gte: start, lte: end } };

  const projects = await prisma.project.findMany({
    where,
    include: {
      departments: { select: { id: true, name: true } },
      tasks: {
        select: {
          id: true,
          status: true,
          dueDate: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      createdBy: { select: { name: true, email: true } },
      _count: { select: { tasks: true, files: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const enriched = projects.map((p) => {
    const tasks = p.tasks;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "DONE").length;
    const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const todoTasks = tasks.filter((t) => t.status === "TODO").length;
    const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
    const rate = completionRate(completedTasks, totalTasks);

    const projectIsOverdue =
      p.endDate && new Date(p.endDate) < now && p.status !== "COMPLETED";
    const daysOverdue = projectIsOverdue
      ? Math.floor((now - new Date(p.endDate)) / (1000 * 60 * 60 * 24))
      : 0;
    const daysRemaining =
      p.endDate && !projectIsOverdue
        ? Math.floor((new Date(p.endDate) - now) / (1000 * 60 * 60 * 24))
        : null;

    // Health: compare expected progress vs actual
    let health = "ON_TRACK";
    if (projectIsOverdue) {
      health = "OVERDUE";
    } else if (p.endDate && p.startDate && p.status !== "COMPLETED") {
      const totalDuration = new Date(p.endDate) - new Date(p.startDate);
      const elapsed = now - new Date(p.startDate);
      const expectedProgress =
        totalDuration > 0
          ? Math.min(100, Math.round((elapsed / totalDuration) * 100))
          : 0;
      if (rate < expectedProgress - 25) health = "AT_RISK";
    }

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      health,
      startDate: p.startDate,
      endDate: p.endDate,
      isOverdue: projectIsOverdue,
      daysOverdue,
      daysRemaining,
      departments: p.departments,
      createdBy: p.createdBy,
      createdAt: p.createdAt,
      metrics: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        overdueTasks,
        completionRate: rate,
        fileCount: p._count.files,
      },
    };
  });

  const byStatus = {
    PLANNED: projects.filter((p) => p.status === "PLANNED").length,
    IN_PROGRESS: projects.filter((p) => p.status === "IN_PROGRESS").length,
    COMPLETED: projects.filter((p) => p.status === "COMPLETED").length,
    ON_HOLD: projects.filter((p) => p.status === "ON_HOLD").length,
  };

  const byHealth = {
    ON_TRACK: enriched.filter((p) => p.health === "ON_TRACK").length,
    AT_RISK: enriched.filter((p) => p.health === "AT_RISK").length,
    OVERDUE: enriched.filter((p) => p.health === "OVERDUE").length,
  };

  const avgRate =
    enriched.length > 0
      ? Math.round(
          enriched.reduce((s, p) => s + p.metrics.completionRate, 0) / enriched.length
        )
      : 0;

  const { buckets: trend, granularity } = buildDailyTrend(
    projects,
    (p) => new Date(p.createdAt),
    start,
    end,
    {
      completed: (items) => items.filter((p) => p.status === "COMPLETED").length,
    }
  );

  return {
    summary: {
      total: projects.length,
      byStatus,
      byHealth,
      avgCompletionRate: avgRate,
      overdueProjects: byHealth.OVERDUE,
    },
    trend: { data: trend, granularity },
    projects: enriched,
  };
};

// ─── 3. Tasks Analytics Report ────────────────────────────────────────────────

export const getTasksReport = async (
  companyId,
  { startDate, endDate, projectId, departmentId } = {}
) => {
  const { start, end } = getDateRange(startDate, endDate);
  const now = new Date();

  const where = { companyId, createdAt: { gte: start, lte: end } };
  if (projectId) where.projectId = projectId;

  const tasks = await prisma.task.findMany({
    where,
    include: {
      project: {
        select: {
          id: true,
          name: true,
          status: true,
          departments: { select: { id: true, name: true } },
        },
      },
      employee: {
        select: {
          id: true,
          name: true,
          position: true,
          department: { select: { id: true, name: true } },
        },
      },
      user: { select: { id: true, name: true, email: true } },
      aiEmployee: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todoTasks = tasks.filter((t) => t.status === "TODO").length;
  const overdueTasks = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
  const aiTasks = tasks.filter((t) => t.aiEmployeeId !== null).length;
  const humanTasks = totalTasks - aiTasks;
  const unassignedTasks = tasks.filter(
    (t) => !t.employeeId && !t.userId && !t.aiEmployeeId
  ).length;

  // Per-project breakdown
  const projectMap = new Map();
  for (const t of tasks) {
    if (!t.project) continue;
    const pid = t.project.id;
    if (!projectMap.has(pid)) {
      projectMap.set(pid, {
        project: t.project,
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0,
        overdue: 0,
      });
    }
    const entry = projectMap.get(pid);
    entry.total++;
    if (t.status === "DONE") entry.completed++;
    else if (t.status === "IN_PROGRESS") entry.inProgress++;
    else entry.todo++;
    if (isOverdue(t.dueDate, t.status)) entry.overdue++;
  }

  const byProject = Array.from(projectMap.values())
    .map((p) => ({ ...p, completionRate: completionRate(p.completed, p.total) }))
    .sort((a, b) => b.total - a.total);

  // Per-assignee workload
  const workloadMap = new Map();
  for (const t of tasks) {
    const key = t.aiEmployeeId ?? t.employeeId ?? t.userId;
    if (!key) continue;
    const name =
      t.aiEmployee?.name ?? t.employee?.name ?? t.user?.name ?? "Unknown";
    const type = t.aiEmployee ? "AI" : t.employee ? "Employee" : "User";
    if (!workloadMap.has(key)) {
      workloadMap.set(key, { id: key, name, type, total: 0, completed: 0, overdue: 0 });
    }
    const entry = workloadMap.get(key);
    entry.total++;
    if (t.status === "DONE") entry.completed++;
    if (isOverdue(t.dueDate, t.status)) entry.overdue++;
  }

  const workload = Array.from(workloadMap.values())
    .map((e) => ({
      ...e,
      completionRate: completionRate(e.completed, e.total),
      productivityScore: productivityScore(e.total, e.completed, e.overdue),
    }))
    .sort((a, b) => b.productivityScore - a.productivityScore);

  // Daily trend
  const { buckets: trend, granularity } = buildDailyTrend(
    tasks,
    (t) => new Date(t.createdAt),
    start,
    end,
    {
      completed: (items) => items.filter((t) => t.status === "DONE").length,
      overdue: (items) => items.filter((t) => isOverdue(t.dueDate, t.status)).length,
    }
  );

  return {
    summary: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      unassignedTasks,
      completionRate: completionRate(completedTasks, totalTasks),
      aiTasks,
      humanTasks,
      aiRatio: totalTasks > 0 ? Math.round((aiTasks / totalTasks) * 100) : 0,
    },
    trend: { data: trend, granularity },
    byProject,
    workload,
  };
};

// ─── 4. Employee Performance Report ──────────────────────────────────────────

export const getEmployeePerformanceReport = async (
  companyId,
  { startDate, endDate, departmentId } = {}
) => {
  const { start, end } = getDateRange(startDate, endDate);

  const empWhere = { companyId };
  if (departmentId) empWhere.departmentId = departmentId;

  const employees = await prisma.employee.findMany({
    where: empWhere,
    include: {
      department: { select: { id: true, name: true } },
      tasks: {
        where: { createdAt: { gte: start, lte: end } },
        select: {
          id: true,
          status: true,
          dueDate: true,
          createdAt: true,
          title: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const enriched = employees.map((emp) => {
    const tasks = emp.tasks;
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "DONE").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const todo = tasks.filter((t) => t.status === "TODO").length;
    const overdue = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;

    return {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      position: emp.position || null,
      role: emp.role,
      department: emp.department,
      taskMetrics: {
        total,
        completed,
        inProgress,
        todo,
        overdue,
        completionRate: completionRate(completed, total),
      },
      productivityScore: productivityScore(total, completed, overdue),
    };
  });

  const withTasks = enriched.filter((e) => e.taskMetrics.total > 0);
  const topPerformers = [...withTasks]
    .sort((a, b) => b.productivityScore - a.productivityScore)
    .slice(0, 10);

  const mostOverdue = [...enriched]
    .filter((e) => e.taskMetrics.overdue > 0)
    .sort((a, b) => b.taskMetrics.overdue - a.taskMetrics.overdue)
    .slice(0, 5);

  const avgScore =
    withTasks.length > 0
      ? Math.round(
          withTasks.reduce((s, e) => s + e.productivityScore, 0) / withTasks.length
        )
      : 0;

  return {
    summary: {
      totalEmployees: employees.length,
      avgProductivityScore: avgScore,
      employeesWithTasks: withTasks.length,
      employeesWithOverdue: enriched.filter((e) => e.taskMetrics.overdue > 0).length,
    },
    topPerformers,
    mostOverdue,
    employees: enriched,
  };
};

// ─── 5. Department Analytics Report ──────────────────────────────────────────

export const getDepartmentReport = async (companyId, { startDate, endDate } = {}) => {
  const { start, end } = getDateRange(startDate, endDate);

  const departments = await prisma.department.findMany({
    where: { companyId },
    include: {
      employeesList: {
        include: {
          tasks: {
            where: { companyId, createdAt: { gte: start, lte: end } },
            select: { id: true, status: true, dueDate: true },
          },
        },
      },
      projects: {
        where: { companyId },
        select: { id: true, name: true, status: true, endDate: true },
      },
      createdBy: { select: { name: true } },
    },
  });

  const enriched = departments.map((dept) => {
    const allTasks = dept.employeesList.flatMap((e) => e.tasks);
    const total = allTasks.length;
    const completed = allTasks.filter((t) => t.status === "DONE").length;
    const overdue = allTasks.filter((t) => isOverdue(t.dueDate, t.status)).length;

    const projectsByStatus = {
      PLANNED: dept.projects.filter((p) => p.status === "PLANNED").length,
      IN_PROGRESS: dept.projects.filter((p) => p.status === "IN_PROGRESS").length,
      COMPLETED: dept.projects.filter((p) => p.status === "COMPLETED").length,
      ON_HOLD: dept.projects.filter((p) => p.status === "ON_HOLD").length,
    };

    return {
      id: dept.id,
      name: dept.name,
      createdBy: dept.createdBy,
      employeeCount: dept.employeesList.length,
      projectCount: dept.projects.length,
      projectsByStatus,
      taskMetrics: {
        total,
        completed,
        inProgress: allTasks.filter((t) => t.status === "IN_PROGRESS").length,
        todo: allTasks.filter((t) => t.status === "TODO").length,
        overdue,
        completionRate: completionRate(completed, total),
      },
    };
  });

  const avgRate =
    enriched.length > 0
      ? Math.round(
          enriched.reduce((s, d) => s + d.taskMetrics.completionRate, 0) / enriched.length
        )
      : 0;

  return {
    summary: {
      totalDepartments: departments.length,
      avgCompletionRate: avgRate,
      totalEmployeesAcrossDepts: enriched.reduce((s, d) => s + d.employeeCount, 0),
      totalProjectsAcrossDepts: enriched.reduce((s, d) => s + d.projectCount, 0),
    },
    departments: enriched.sort(
      (a, b) => b.taskMetrics.total - a.taskMetrics.total
    ),
  };
};

// ─── 6. Activity / Audit Report ───────────────────────────────────────────────

export const getActivityReport = async (
  companyId,
  { startDate, endDate, userId } = {}
) => {
  const { start, end } = getDateRange(startDate, endDate);

  const where = { companyId, createdAt: { gte: start, lte: end } };
  if (userId) where.performedById = userId;

  const [logs, totalLogs] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        performedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  // Frequency maps
  const actionFreq = {};
  const userFreq = {};
  const entityFreq = {};

  for (const log of logs) {
    if (log.action) actionFreq[log.action] = (actionFreq[log.action] || 0) + 1;
    if (log.entity) entityFreq[log.entity] = (entityFreq[log.entity] || 0) + 1;
    if (log.performedBy) {
      const key = log.performedBy.email;
      if (!userFreq[key]) userFreq[key] = { user: log.performedBy, count: 0 };
      userFreq[key].count++;
    }
  }

  const topActions = Object.entries(actionFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([action, count]) => ({ action, count }));

  const mostActiveUsers = Object.values(userFreq)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const entityBreakdown = Object.entries(entityFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([entity, count]) => ({ entity, count }));

  const { buckets: trend, granularity } = buildDailyTrend(
    logs,
    (l) => new Date(l.createdAt),
    start,
    end
  );

  return {
    summary: { totalLogs, showing: logs.length },
    topActions,
    mostActiveUsers,
    entityBreakdown,
    trend: { data: trend, granularity },
    logs,
  };
};

// ─── 7. AI Analytics Report ───────────────────────────────────────────────────

export const getAIReport = async (companyId, { startDate, endDate } = {}) => {
  const { start, end } = getDateRange(startDate, endDate);

  const [aiEmployees, aiTasks] = await Promise.all([
    prisma.aIEmployee.findMany({
      where: { companyId },
      include: {
        tasks: {
          where: { createdAt: { gte: start, lte: end } },
          select: {
            id: true,
            status: true,
            priority: true,
            createdAt: true,
            executedAt: true,
          },
        },
      },
    }),
    prisma.aITask.findMany({
      where: { companyId, createdAt: { gte: start, lte: end } },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        executedAt: true,
        aiEmployee: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalAITasks = aiTasks.length;
  const byStatus = {
    PENDING: aiTasks.filter((t) => t.status === "PENDING").length,
    IN_PROGRESS: aiTasks.filter((t) => t.status === "IN_PROGRESS").length,
    COMPLETED: aiTasks.filter((t) => t.status === "COMPLETED").length,
    NEEDS_CLARIFICATION: aiTasks.filter((t) => t.status === "NEEDS_CLARIFICATION").length,
    FAILED: aiTasks.filter((t) => t.status === "FAILED").length,
  };
  const byPriority = {
    HIGH: aiTasks.filter((t) => t.priority === "HIGH").length,
    MEDIUM: aiTasks.filter((t) => t.priority === "MEDIUM").length,
    LOW: aiTasks.filter((t) => t.priority === "LOW").length,
  };

  const enrichedEmployees = aiEmployees.map((ai) => {
    const tasks = ai.tasks;
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    const failed = tasks.filter((t) => t.status === "FAILED").length;
    return {
      id: ai.id,
      name: ai.name,
      role: ai.role,
      department: ai.department,
      isActive: ai.isActive,
      taskMetrics: {
        total,
        completed,
        failed,
        pending: tasks.filter((t) => t.status === "PENDING").length,
        completionRate: completionRate(completed, total),
      },
    };
  });

  const { buckets: trend, granularity } = buildDailyTrend(
    aiTasks,
    (t) => new Date(t.createdAt),
    start,
    end,
    {
      completed: (items) => items.filter((t) => t.status === "COMPLETED").length,
      failed: (items) => items.filter((t) => t.status === "FAILED").length,
    }
  );

  return {
    summary: {
      totalAIEmployees: aiEmployees.length,
      activeAIEmployees: aiEmployees.filter((a) => a.isActive).length,
      totalAITasks,
      byStatus,
      byPriority,
      completionRate: completionRate(byStatus.COMPLETED, totalAITasks),
      failureRate: totalAITasks > 0
        ? Math.round((byStatus.FAILED / totalAITasks) * 100)
        : 0,
    },
    aiEmployees: enrichedEmployees.sort((a, b) => b.taskMetrics.total - a.taskMetrics.total),
    trend: { data: trend, granularity },
    recentTasks: aiTasks.slice(0, 20),
  };
};

// ─── 8. Task Trends (sub-route) ───────────────────────────────────────────────

export const getTasksTrends = async (companyId, { startDate, endDate, projectId } = {}) => {
  const { start, end } = getDateRange(startDate, endDate);
  const where = { companyId, createdAt: { gte: start, lte: end } };
  if (projectId) where.projectId = projectId;

  const tasks = await prisma.task.findMany({
    where,
    select: { id: true, status: true, dueDate: true, createdAt: true },
  });

  const { buckets: trend, granularity } = buildDailyTrend(
    tasks,
    (t) => new Date(t.createdAt),
    start,
    end,
    {
      completed: (items) => items.filter((t) => t.status === "DONE").length,
      overdue: (items) => items.filter((t) => isOverdue(t.dueDate, t.status)).length,
    }
  );

  return { trend: { data: trend, granularity }, period: { start, end } };
};

// ─── 9. Project Health (sub-route) ────────────────────────────────────────────

export const getProjectsHealth = async (companyId, { startDate, endDate } = {}) => {
  const { start, end } = getDateRange(startDate, endDate);
  const now = new Date();

  const projects = await prisma.project.findMany({
    where: { companyId },
    include: {
      departments: { select: { id: true, name: true } },
      tasks: { select: { id: true, status: true, dueDate: true } },
      _count: { select: { tasks: true } },
    },
  });

  const enriched = projects.map((p) => {
    const tasks = p.tasks;
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "DONE").length;
    const rate = completionRate(completed, total);

    const projectIsOverdue = p.endDate && new Date(p.endDate) < now && p.status !== "COMPLETED";

    let health = "ON_TRACK";
    if (projectIsOverdue) {
      health = "OVERDUE";
    } else if (p.endDate && p.startDate && p.status !== "COMPLETED") {
      const totalDuration = new Date(p.endDate) - new Date(p.startDate);
      const elapsed = now - new Date(p.startDate);
      const expectedProgress =
        totalDuration > 0 ? Math.min(100, Math.round((elapsed / totalDuration) * 100)) : 0;
      if (rate < expectedProgress - 25) health = "AT_RISK";
    }

    return {
      id: p.id,
      name: p.name,
      status: p.status,
      health,
      startDate: p.startDate,
      endDate: p.endDate,
      departments: p.departments,
      completionRate: rate,
      totalTasks: total,
      completedTasks: completed,
    };
  });

  const byHealth = {
    ON_TRACK: enriched.filter((p) => p.health === "ON_TRACK").length,
    AT_RISK: enriched.filter((p) => p.health === "AT_RISK").length,
    OVERDUE: enriched.filter((p) => p.health === "OVERDUE").length,
  };

  return { summary: { total: projects.length, byHealth }, projects: enriched };
};

// ─── 10. CSV Export Helpers ───────────────────────────────────────────────────

const buildCSV = (headers, rows) => {
  const escape = (val) => {
    if (val === null || val === undefined) return "";
    const s = String(val);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  return [headers.join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
};

export const exportTasksCSV = async (companyId, { startDate, endDate, projectId } = {}) => {
  const { start, end } = getDateRange(startDate, endDate);
  const where = { companyId, createdAt: { gte: start, lte: end } };
  if (projectId) where.projectId = projectId;

  const tasks = await prisma.task.findMany({
    where,
    include: {
      project: { select: { name: true } },
      employee: { select: { name: true } },
      user: { select: { name: true } },
      aiEmployee: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "ID", "Title", "Status", "Project",
    "Assigned To", "Assignee Type", "Due Date",
    "AI Executed", "Created At",
  ];
  const rows = tasks.map((t) => [
    t.id,
    t.title,
    t.status,
    t.project?.name ?? "",
    t.employee?.name ?? t.user?.name ?? t.aiEmployee?.name ?? "Unassigned",
    t.aiEmployee ? "AI" : t.employee ? "Employee" : t.user ? "User" : "None",
    t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : "",
    t.aiExecutedAt ? "Yes" : "No",
    new Date(t.createdAt).toISOString().slice(0, 10),
  ]);

  return buildCSV(headers, rows);
};

export const exportEmployeesCSV = async (
  companyId,
  { startDate, endDate, departmentId } = {}
) => {
  const { start, end } = getDateRange(startDate, endDate);
  const where = { companyId };
  if (departmentId) where.departmentId = departmentId;

  const employees = await prisma.employee.findMany({
    where,
    include: {
      department: { select: { name: true } },
      tasks: {
        where: { createdAt: { gte: start, lte: end } },
        select: { id: true, status: true, dueDate: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const headers = [
    "ID", "Name", "Email", "Position", "Role", "Department",
    "Total Tasks", "Completed", "Overdue",
    "Completion Rate %", "Productivity Score",
  ];
  const rows = employees.map((e) => {
    const total = e.tasks.length;
    const completed = e.tasks.filter((t) => t.status === "DONE").length;
    const overdue = e.tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
    return [
      e.id,
      e.name,
      e.email,
      e.position ?? "",
      e.role,
      e.department?.name ?? "",
      total,
      completed,
      overdue,
      completionRate(completed, total),
      productivityScore(total, completed, overdue),
    ];
  });

  return buildCSV(headers, rows);
};
