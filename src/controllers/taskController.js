import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  executeTaskWithAI,
} from "../services/taskService.js";
import * as activityService from "../services/activityService.js";
import logger from "../utils/logger.js";
import { Cache } from "../utils/cache.js";
import { CacheKeys } from "../utils/cacheKeys.js";

export const createTaskController = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const task = await createTask(req.body, companyId);
    await activityService.logActivity({
      action: "TASK_CREATED",
      entity: "Task",
      entityId: task.id,
      userId: req.user?.id,
      companyId,
      details: JSON.stringify({ title: task.title, assignedToId: task.assignedToId }),
    });
    logger.info(`✅ Task created: ${task.title} by user ${req.user?.id}`);
    await Cache.del(CacheKeys.tasks.all + ":" + companyId);
    res.status(201).json(task);
  } catch (error) {
    logger.error(`❌ Error creating task: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

export const getTasksController = async (req, res) => {
  try {
    const { projectId } = req.query;
    const companyId = req.companyId || req.user.companyId;

    // ✅ Check cache first
    const cacheKey = projectId
      ? `${CacheKeys.tasks.all}:${companyId}:${projectId}`
      : `${CacheKeys.tasks.all}:${companyId}`;

    const cached = await Cache.get(cacheKey);
    if (cached) {
      logger.info("📦 Tasks fetched from cache");
      return res.status(200).json(JSON.parse(cached));
    }

    const tasks = await getAllTasks(projectId, companyId);

    await Cache.set(cacheKey, JSON.stringify(tasks), 60); // 60s TTL for tasks
    logger.info(`Get All Tasks: ${tasks.length} results for company ${companyId}`);
    res.status(200).json(tasks);
  } catch (error) {
    logger.error(`❌ Error getting all tasks: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const getTaskByIdController = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const task = await getTaskById(req.params.id, companyId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    logger.info(`Get Task By ID: ${task.title} ID: ${task.id}`);
    res.json(task);
  } catch (error) {
    logger.error(`❌ Error getting task by ID: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const updateTaskController = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const task = await updateTask(req.params.id, { ...req.body, companyId });
    await activityService.logActivity({
      action: "TASK_UPDATED",
      entity: "Task",
      entityId: req.params.id,
      userId: req.user?.id,
      companyId,
    });
    // ✅ Bust both global and project-specific cache
    await Cache.del(`${CacheKeys.tasks.all}:${companyId}`);
    if (task.projectId) {
      await Cache.del(`${CacheKeys.tasks.all}:${companyId}:${task.projectId}`);
    }
    res.json(task);
  } catch (error) {
    logger.error(`❌ Error updating task: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

export const deleteTaskController = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    await deleteTask(req.params.id, companyId);
    await Cache.del(`${CacheKeys.tasks.all}:${companyId}`);
    logger.info(`✅ Task deleted: ${req.params.id}`);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    logger.error(`❌ Error deleting task: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// ─── NEW: Execute task with AI employee ──────────────────────────────────────
export const executeTaskWithAIController = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const { id: taskId } = req.params;
    const { aiEmployeeId } = req.body;

    if (!aiEmployeeId) {
      return res.status(400).json({ error: "aiEmployeeId is required" });
    }

    logger.info(`🤖 Executing task ${taskId} with AI employee ${aiEmployeeId}`);

    const task = await executeTaskWithAI(taskId, aiEmployeeId, companyId);

    // Bust cache after AI execution updates the task
    await Cache.del(`${CacheKeys.tasks.all}:${companyId}`);
    if (task.projectId) {
      await Cache.del(`${CacheKeys.tasks.all}:${companyId}:${task.projectId}`);
    }

    await activityService.logActivity({
      action: "TASK_AI_EXECUTED",
      entity: "Task",
      entityId: taskId,
      userId: req.user?.id,
      companyId,
      details: JSON.stringify({ aiEmployeeId }),
    });

    res.status(200).json(task);
  } catch (error) {
    logger.error(`❌ AI task execution failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
