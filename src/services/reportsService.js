// ─── src/services/reportsService.js ──────────────────────────────────────────

import prisma from "../utils/prismaClient.js";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function parseDates(filters) {
  const start = filters.startDate
    ? new Date(filters.startDate)
    : new Date(Date.now() - 30 * 86400000);
  const end = filters.endDate
    ? new Date(filters.endDate + "T23:59:59")
    : new Date();
  return { start, end };
}

function calcProductivityScore({ total, completed, overdue }) {
  if (total === 0) return 0;
  const completionWeight = (completed / total) * 70;
  const overdueWeight = (overdue / total) * 30;
  return Math.round(Math.max(0, completionWeight - overdueWeight));
}

// ─── 1. Overview Report ───────────────────────────────────────────────────────

export const getOverviewReport = async (companyId, filters) => {
  const { start, end } = parseDates(filters);
  const now = new Date();

  const where = {
    companyId,
    createdAt: { gte: start, lte: end },
    ...(filters.projectId ? { projectId: filters.projectId } : {}),
  };

  const [tasks, projects, aiTasks] = await Promise.all([
    prisma.task.findMany({
      where,
      select: { id: true, status: true, dueDate: true, priority: true },
    }),
    prisma.project.findMany({
      where: { companyId },
      include: {
        tasks: { select: { status: true, dueDate: true } },
      },
    }),
    prisma.aITask.findMany({
      where: { companyId, createdAt: { gte: start, lte: end } },
      select: { id: true, status: true },
    }),
  ]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "DONE").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const todo = tasks.filter((t) => t.status === "TODO").length;
  const overdue = tasks.filter(
    (t) => t.dueDate && t.status !== "DONE" && new Date(t.dueDate) < now
  ).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const overdueRate = total > 0 ? Math.round((overdue / total) * 100) : 0;

  // Project health
  let onTrack = 0, atRisk = 0, overdueProjects = 0;
  projects.forEach((p) => {
    const hasOverdue = p.tasks.some(
      (t) => t.dueDate && t.status !== "DONE" && new Date(t.dueDate) < now
    );
    if (hasOverdue) overdueProjects++;
    else if (p.status === "IN_PROGRESS") atRisk++;
    else onTrack++;
  });

  const productivityScore = calcProductivityScore({ total, completed, overdue });

  return {
    productivityScore,
    taskSummary: {
      total, completed, inProgress, todo, overdue,
      completionRate, overdueRate,
    },
    projectHealth: {
      onTrack, atRisk,
      overdue: overdueProjects,
      total: projects.length,
    },
    aiSummary: {
      total: aiTasks.length,
      completed: aiTasks.filter((t) => t.status === "COMPLETED").length,
    },
    generatedAt: new Date().toISOString(),
  };
};

// ─── 2. Task Trends ───────────────────────────────────────────────────────────

export const getTasksTrends = async (companyId, filters) => {
  const { start, end } = parseDates(filters);

  const tasks = await prisma.task.findMany({
    where: {
      companyId,
      createdAt: { gte: start, lte: end },
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    },
    select: { createdAt: true, status: true },
  });

  const diffDays = Math.ceil((end - start) / 86400000);
  const useWeekly = diffDays > 90;
  const trends = [];

  if (useWeekly) {
    const weeks = Math.ceil(diffDays / 7);
    for (let i = 0; i < weeks; i++) {
      const wStart = new Date(start);
      wStart.setDate(wStart.getDate() + i * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(wEnd.getDate() + 7);

      const created = tasks.filter((t) => {
        const d = new Date(t.createdAt);
        return d >= wStart && d < wEnd;
      }).length;
      const completed = tasks.filter((t) => {
        const d = new Date(t.createdAt);
        return d >= wStart && d < wEnd && t.status === "DONE";
      }).length;

      trends.push({ label: `W${i + 1}`, created, completed });
    }
  } else {
    for (let i = 0; i < diffDays; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);

      const created = tasks.filter((t) => {
        const d = new Date(t.createdAt);
        return d >= day && d < nextDay;
      }).length;
      const completed = tasks.filter((t) => {
        const d = new Date(t.createdAt);
        return d >= day && d < nextDay && t.status === "DONE";
      }).length;

      trends.push({
        label: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        created,
        completed,
      });
    }
  }

  return { trends };
};

// ─── 3. Projects Report ───────────────────────────────────────────────────────

export const getProjectsReport = async (companyId, filters) => {
  const { start, end } = parseDates(filters);
  const now = new Date();

  const projects = await prisma.project.findMany({
    where: { companyId },
    include: {
      departments: { select: { name: true } },
      tasks: {
        where: { createdAt: { gte: start, lte: end } },
        select: { status: true, dueDate: true, priority: true },
      },
      createdBy: { select: { name: true, email: true } },
    },
  });

  const result = projects.map((p) => {
    const total = p.tasks.length;
    const completed = p.tasks.filter((t) => t.status === "DONE").length;
    const overdue = p.tasks.filter(
      (t) => t.dueDate && t.status !== "DONE" && new Date(t.dueDate) < now
    ).length;
    const completionPercent =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    let health = "ON_TRACK";
    if (overdue > 0) health = "OVERDUE";
    else if (completionPercent < 50 && p.status === "IN_PROGRESS") health = "AT_RISK";

    return {
      id: p.id,
      name: p.name,
      status: p.status,
      health,
      completionPercent,
      taskCount: total,
      completedTasks: completed,
      overdueTasks: overdue,
      departments: p.departments.map((d) => d.name),
      createdBy: p.createdBy?.name || p.createdBy?.email || "—",
      startDate: p.startDate,
      endDate: p.endDate,
    };
  });

  return { projects: result };
};

// ─── 4. Projects Health (used by /projects/health route) ─────────────────────

export const getProjectsHealth = async (companyId, filters) => {
  const { start, end } = parseDates(filters);
  const now = new Date();

  const projects = await prisma.project.findMany({
    where: { companyId },
    include: {
      tasks: { select: { status: true, dueDate: true } },
    },
  });

  const result = projects.map((p) => {
    const total = p.tasks.length;
    const completed = p.tasks.filter((t) => t.status === "DONE").length;
    const hasOverdue = p.tasks.some(
      (t) => t.dueDate && t.status !== "DONE" && new Date(t.dueDate) < now
    );
    const completionPercent =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    let health = "ON_TRACK";
    if (hasOverdue) health = "OVERDUE";
    else if (completionPercent < 50 && p.status === "IN_PROGRESS") health = "AT_RISK";

    return {
      id: p.id,
      name: p.name,
      health,
      completionPercent,
      taskCount: total,
      dueDate: p.endDate,
    };
  });

  return { projects: result };
};

// ─── 5. Tasks Report ──────────────────────────────────────────────────────────

export const getTasksReport = async (companyId, filters) => {
  const { start, end } = parseDates(filters);
  const now = new Date();

  const tasks = await prisma.task.findMany({
    where: {
      companyId,
      createdAt: { gte: start, lte: end },
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    },
    include: {
      project: { select: { name: true } },
      employee: { select: { name: true } },
      aiEmployee: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "DONE").length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const overdue = tasks.filter(
    (t) => t.dueDate && t.status !== "DONE" && new Date(t.dueDate) < now
  ).length;
  const aiExecuted = tasks.filter((t) => t.aiEmployee !== null).length;

  return {
    summary: {
      total, completed, inProgress, overdue, aiExecuted,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    },
    tasks,
  };
};

// ─── 6. Employee Performance ──────────────────────────────────────────────────

export const getEmployeePerformanceReport = async (companyId, filters) => {
  const { start, end } = parseDates(filters);
  const now = new Date();

  const employees = await prisma.employee.findMany({
    where: {
      companyId,
      ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
    },
    include: {
      department: { select: { name: true } },
      tasks: {
        where: { createdAt: { gte: start, lte: end } },
        select: { status: true, dueDate: true, priority: true },
      },
    },
  });

  const result = employees.map((emp) => {
    const total = emp.tasks.length;
    const completed = emp.tasks.filter((t) => t.status === "DONE").length;
    const overdue = emp.tasks.filter(
      (t) => t.dueDate && t.status !== "DONE" && new Date(t.dueDate) < now
    ).length;
    const score = calcProductivityScore({ total, completed, overdue });

    return {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role: emp.role,
      department: emp.department?.name || "—",
      taskStats: {
        total, completed, overdue,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      },
      productivityScore: score,
    };
  });

  // Sort by productivity score descending
  result.sort((a, b) => b.productivityScore - a.productivityScore);

  return { employees: result };
};

// ─── 7. Department Report ─────────────────────────────────────────────────────

export const getDepartmentReport = async (companyId, filters) => {
  const { start, end } = parseDates(filters);
  const now = new Date();

  const departments = await prisma.department.findMany({
    where: { companyId },
    include: {
      _count: { select: { employees: true } },
      projects: {
        include: {
          tasks: {
            where: { createdAt: { gte: start, lte: end } },
            select: { status: true, dueDate: true },
          },
        },
      },
    },
  });

  const result = departments.map((dept) => {
    const tasks = dept.projects.flatMap((p) => p.tasks);
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "DONE").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const overdue = tasks.filter(
      (t) => t.dueDate && t.status !== "DONE" && new Date(t.dueDate) < now
    ).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const productivityScore = calcProductivityScore({ total, completed, overdue });

    return {
      id: dept.id,
      name: dept.name,
      employeeCount: dept._count.employees,
      projectCount: dept.projects.length,
      taskStats: { total, completed, inProgress, overdue, completionRate },
      productivityScore,
    };
  });

  return { departments: result };
};

// ─── 8. Activity Report ───────────────────────────────────────────────────────

export const getActivityReport = async (companyId, filters) => {
  const { start, end } = parseDates(filters);

  const logs = await prisma.activityLog.findMany({
    where: {
      companyId,
      createdAt: { gte: start, lte: end },
      ...(filters.userId ? { userId: filters.userId } : {}),
    },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Action frequency
  const actionMap = {};
  logs.forEach((l) => {
    actionMap[l.action] = (actionMap[l.action] || 0) + 1;
  });
  const topActions = Object.entries(actionMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([action, count]) => ({ action, count }));

  return { logs, topActions, total: logs.length };
};

// ─── 9. AI Report ─────────────────────────────────────────────────────────────

export const getAIReport = async (companyId, filters) => {
  const { start, end } = parseDates(filters);

  const [aiTasks, aiEmployees] = await Promise.all([
    prisma.aITask.findMany({
      where: { companyId, createdAt: { gte: start, lte: end } },
      include: { aiEmployee: { select: { name: true, role: true, department: true } } },
    }),
    prisma.aIEmployee.findMany({
      where: { companyId },
      include: { _count: { select: { tasks: true } } },
    }),
  ]);

  const total = aiTasks.length;
  const completed = aiTasks.filter((t) => t.status === "COMPLETED").length;
  const failed = aiTasks.filter((t) => t.status === "FAILED").length;

  const perAgent = aiEmployees.map((agent) => {
    const agentTasks = aiTasks.filter((t) => t.aiEmployee?.name === agent.name);
    return {
      id: agent.id,
      name: agent.name,
      role: agent.role,
      department: agent.department,
      totalTasks: agentTasks.length,
      completedTasks: agentTasks.filter((t) => t.status === "COMPLETED").length,
      failedTasks: agentTasks.filter((t) => t.status === "FAILED").length,
    };
  });

  return {
    summary: { total, completed, failed, successRate: total > 0 ? Math.round((completed / total) * 100) : 0 },
    perAgent,
  };
};

// ─── 10. CSV Exports ──────────────────────────────────────────────────────────

export const exportTasksCSV = async (companyId, filters) => {
  const { start, end } = parseDates(filters);

  const tasks = await prisma.task.findMany({
    where: {
      companyId,
      createdAt: { gte: start, lte: end },
      ...(filters.projectId ? { projectId: filters.projectId } : {}),
    },
    include: {
      project: { select: { name: true } },
      employee: { select: { name: true } },
      aiEmployee: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const header = "Title,Status,Priority,Project,Assigned To,AI Agent,Due Date,Created At\n";
  const rows = tasks.map((t) =>
    [
      `"${t.title}"`,
      t.status,
      t.priority || "",
      `"${t.project?.name || ""}"`,
      `"${t.employee?.name || ""}"`,
      `"${t.aiEmployee?.name || ""}"`,
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "",
      new Date(t.createdAt).toLocaleDateString(),
    ].join(",")
  ).join("\n");

  return header + rows;
};

export const exportEmployeesCSV = async (companyId, filters) => {
  const { start, end } = parseDates(filters);
  const now = new Date();

  const employees = await prisma.employee.findMany({
    where: {
      companyId,
      ...(filters.departmentId ? { departmentId: filters.departmentId } : {}),
    },
    include: {
      department: { select: { name: true } },
      tasks: {
        where: { createdAt: { gte: start, lte: end } },
        select: { status: true, dueDate: true },
      },
    },
  });

  const header = "Name,Email,Role,Department,Total Tasks,Completed,Overdue,Completion Rate\n";
  const rows = employees.map((emp) => {
    const total = emp.tasks.length;
    const completed = emp.tasks.filter((t) => t.status === "DONE").length;
    const overdue = emp.tasks.filter(
      (t) => t.dueDate && t.status !== "DONE" && new Date(t.dueDate) < now
    ).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return [
      `"${emp.name}"`,
      emp.email,
      emp.role,
      `"${emp.department?.name || ""}"`,
      total, completed, overdue,
      `${rate}%`,
    ].join(",");
  }).join("\n");

  return header + rows;
};
