import prisma from "../utils/prismaClient.js";
import Anthropic from "@anthropic-ai/sdk";
import logger from "../utils/logger.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Full task include — used everywhere for consistent shape ─────────────────
const TASK_INCLUDE = {
  project: {
    include: {
      departments: { select: { id: true, name: true } },
    },
  },
  employee: { select: { id: true, name: true, email: true, role: true } },
  aiEmployee: { select: { id: true, name: true, role: true, department: true } },
};

// ─── Create Task ─────────────────────────────────────────────────────────────
export const createTask = async (data, companyId) => {
  const { title, description, status, dueDate, projectId, assignedToId, priority } = data;

  if (!projectId || !assignedToId) {
    throw new Error("projectId and assignedToId are required");
  }

  const [project, employee] = await Promise.all([
    prisma.project.findFirst({ where: { id: projectId, companyId } }),
    prisma.employee.findFirst({ where: { id: assignedToId, companyId } }),
  ]);

  if (!project || !employee) {
    throw new Error("Project or employee does not belong to your company");
  }

  return await prisma.task.create({
    data: {
      title,
      description,
      status: status || "TODO",
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      project: { connect: { id: projectId } },
      employee: { connect: { id: assignedToId } },
      company: { connect: { id: companyId } },
    },
    include: TASK_INCLUDE,
  });
};

// ─── Get All Tasks (global + per-project) ────────────────────────────────────
export const getAllTasks = async (projectId, companyId) => {
  const where = projectId ? { projectId, companyId } : { companyId };
  return await prisma.task.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: TASK_INCLUDE,
  });
};

// ─── Get Task By ID ──────────────────────────────────────────────────────────
export const getTaskById = async (id, companyId) => {
  return await prisma.task.findFirst({
    where: { id, companyId },
    include: TASK_INCLUDE,
  });
};

// ─── Update Task ─────────────────────────────────────────────────────────────
export const updateTask = async (id, data) => {
  const { companyId, ...rest } = data;
  return await prisma.task.update({
    where: { id },
    data: { ...rest },
    include: TASK_INCLUDE,
  });
};

// ─── Delete Task ─────────────────────────────────────────────────────────────
export const deleteTask = async (id, companyId) => {
  return await prisma.task.deleteMany({ where: { id, companyId } });
};

// ─── Execute Task with AI Employee ───────────────────────────────────────────
export const executeTaskWithAI = async (taskId, aiEmployeeId, companyId) => {
  // Load task with all context
  const task = await prisma.task.findFirst({
    where: { id: taskId, companyId },
    include: TASK_INCLUDE,
  });

  if (!task) throw new Error("Task not found");

  // Load the AI employee
  const aiEmployee = await prisma.aIEmployee.findFirst({
    where: { id: aiEmployeeId, companyId, isActive: true },
  });

  if (!aiEmployee) throw new Error("AI Employee not found or inactive");

  // Build rich context from task data
  const projectName = task.project?.name || "Unknown Project";
  const departments = task.project?.departments?.map((d) => d.name).join(", ") || "None";
  const assignedEmployee = task.employee?.name || "Unassigned";
  const dueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : "No due date";

  const systemPrompt = `
You are ${aiEmployee.name}, an AI Employee working inside a Company Management System.
Role: ${aiEmployee.role}
Department: ${aiEmployee.department}
Permissions: ${aiEmployee.permissions.join(", ")}

You are NOT a chatbot. You are a professional autonomous AI worker assigned to complete real company tasks.

RULES:
- Never hallucinate data. State "Insufficient data" if needed.
- Think in business impact terms.
- Be proactive, analytical, and outcome-driven.
- Act like a senior-level employee.

STRICT OUTPUT FORMAT — respond ONLY with valid JSON, no markdown:
{
  "taskSummary": "brief understanding of the task",
  "plan": ["step 1", "step 2", "step 3"],
  "execution": "detailed output, analysis, document, or plan",
  "status": "COMPLETED",
  "impact": "business value in 1-2 lines",
  "suggestions": ["optional proactive suggestions"]
}
`.trim();

  const userMessage = `
TASK ASSIGNED TO YOU:
Title: ${task.title}
Description: ${task.description || "No description"}
Project: ${projectName}
Departments involved: ${departments}
Human assignee: ${assignedEmployee}
Priority: ${task.priority}
Due date: ${dueDate}
Current status: ${task.status}

Execute this task professionally and return your JSON response.
`.trim();

  logger.info(`🤖 AI Employee ${aiEmployee.name} executing task: ${task.title}`);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const rawText = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  let aiResult;
  try {
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    aiResult = JSON.parse(cleaned);
  } catch {
    aiResult = {
      taskSummary: task.title,
      plan: ["Task analyzed and executed"],
      execution: rawText,
      status: "COMPLETED",
      impact: "Task completed by AI employee",
      suggestions: [],
    };
  }

  // Save AI result + link AI employee to the task
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      aiEmployee: { connect: { id: aiEmployeeId } },
      aiResult,
      aiExecutedAt: new Date(),
    },
    include: TASK_INCLUDE,
  });

  // Log as an AI task in the AITask table too
  await prisma.aITask.create({
    data: {
      title: task.title,
      description: task.description || task.title,
      status: "COMPLETED",
      priority: task.priority || "MEDIUM",
      aiEmployeeId,
      assignedById: task.employee?.id || aiEmployeeId,
      companyId,
      result: aiResult,
      executedAt: new Date(),
    },
  });

  logger.info(`✅ AI task executed: ${task.title} by ${aiEmployee.name}`);
  return updatedTask;
};
