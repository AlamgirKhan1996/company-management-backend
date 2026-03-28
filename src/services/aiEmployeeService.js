import Anthropic from "@anthropic-ai/sdk";
import prisma from "../utils/prismaClient.js";
import logger from "../utils/logger.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Build the system prompt dynamically per agent
function buildSystemPrompt(agent) {
  return `
You are an AI Employee working inside a Company Management System.
You are NOT a chatbot. You are a professional autonomous AI worker.

IDENTITY:
- Name: ${agent.name}
- Role: ${agent.role}
- Department: ${agent.department}
- Permissions: ${agent.permissions.join(", ")}

PRIMARY OBJECTIVE:
Complete assigned tasks with maximum productivity, accuracy, and business impact.

RULES:
- Never hallucinate data. If data is missing, state "Insufficient data"
- Always think in business impact terms
- Be proactive, analytical, and outcome-driven
- Act like a senior-level employee, not a beginner

STRICT OUTPUT FORMAT — You must ALWAYS respond in this exact JSON format:
{
  "taskSummary": "short understanding of the task",
  "plan": ["step 1", "step 2", "step 3"],
  "execution": "actual result, document, analysis, or output as detailed text",
  "status": "COMPLETED | PENDING | NEEDS_CLARIFICATION | FAILED",
  "impact": "business value explanation in 1-2 lines",
  "suggestions": ["optional proactive suggestions"]
}

Return ONLY valid JSON. No markdown, no extra text outside the JSON.
`.trim();
}

// Core function: assign a task to an AI employee and get structured result
export const executeTask = async (agentId, taskData, companyId) => {
  const agent = await prisma.aIEmployee.findFirst({
    where: { id: agentId, companyId, isActive: true },
  });

  if (!agent) throw new Error("AI Employee not found or inactive");

  // Create the task record first
  const task = await prisma.aITask.create({
    data: {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || "MEDIUM",
      status: "IN_PROGRESS",
      aiEmployeeId: agentId,
      assignedById: taskData.assignedById,
      companyId,
    },
  });

  try {
    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: buildSystemPrompt(agent),
      messages: [
        {
          role: "user",
          content: `
TASK ASSIGNED:
Title: ${taskData.title}
Description: ${taskData.description}
Priority: ${taskData.priority || "MEDIUM"}
Context: ${taskData.context || "No additional context provided"}

Execute this task now and return your structured JSON response.
          `.trim(),
        },
      ],
    });

    // Parse the JSON response from Claude
    const rawText = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    let result;
    try {
      // Strip any accidental markdown fences
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      result = JSON.parse(cleaned);
    } catch {
      // If Claude returns invalid JSON, wrap it
      result = {
        taskSummary: taskData.title,
        plan: ["Task executed"],
        execution: rawText,
        status: "COMPLETED",
        impact: "Task completed by AI employee",
        suggestions: [],
      };
    }

    // Map AI status string to Prisma enum
    const statusMap = {
      COMPLETED: "COMPLETED",
      PENDING: "PENDING",
      NEEDS_CLARIFICATION: "NEEDS_CLARIFICATION",
      FAILED: "FAILED",
    };

    // Update task with result
    const updatedTask = await prisma.aITask.update({
      where: { id: task.id },
      data: {
        status: statusMap[result.status] || "COMPLETED",
        result,
        executedAt: new Date(),
      },
      include: { aiEmployee: true },
    });

    logger.info(`✅ AI Task executed: ${task.title} by ${agent.name}`);
    return updatedTask;
  } catch (err) {
    // Mark task as failed
    await prisma.aITask.update({
      where: { id: task.id },
      data: { status: "FAILED" },
    });
    logger.error(`❌ AI Task failed: ${err.message}`);
    throw err;
  }
};

export const createAIEmployee = async (data, companyId) => {
  return await prisma.aIEmployee.create({
    data: {
      name: data.name,
      role: data.role,
      department: data.department,
      permissions: data.permissions || [],
      companyId,
    },
  });
};

export const getAllAIEmployees = async (companyId) => {
  return await prisma.aIEmployee.findMany({
    where: { companyId },
    include: {
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getAIEmployeeTasks = async (agentId, companyId) => {
  return await prisma.aITask.findMany({
    where: { aiEmployeeId: agentId, companyId },
    include: { aiEmployee: true },
    orderBy: { createdAt: "desc" },
  });
};