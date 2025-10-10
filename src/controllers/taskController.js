import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../services/taskService.js";
import * as activityService from "../services/activityService.js";

export const createTaskController = async (req, res) => {
  try {
    const task = await createTask(req.body);
    await activityService.logActivity({
      action: "TASK_CREATED",
      entity: "Task",
      entityId: task.id,
      details: JSON.stringify({
        description: task.description,
        assignedToId: task.assignedToId,
        employeeId: task.employeeId,
        dueDate: task.dueDate,

      })
    })
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getTasksController = async (req, res) => {
  try {
    const tasks = await getAllTasks();
      await activityService.logActivity({
      action: "GET_ALL_TASKS",
      entity: "Task",
      userId: req.user,
      details: JSON.stringify({
        taskCount: tasks.length
      })
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getTaskByIdController = async (req, res) => {
  try {
    const task = await getTaskById(req.params.id);
      await activityService.logActivity({
      action: "GET_TASK_BY_ID",
      entity: "Task",
      entityId: req.params.id,
      userId: req.user.id,
      details: JSON.stringify({
        taskDescription: task.description,
      })
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTaskController = async (req, res) => {
  try {
    const task = await updateTask(req.params.id, req.body);
    // await activityService.logActivity({
    //   action: "TASK_UPDATED",
    //   entity: "Task",
    //   entityId: task.id,
    //   userId: req.user.id,
    //   details: JSON.stringify({
    //     description: task.description,
    //     assignedToId: task.assignedToId,
    //     employeeId: task.employeeId,
    //     dueDate: task.dueDate,
    //   })
    // });
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteTaskController = async (req, res) => {
  try {
    await deleteTask(req.params.id);
    // await activityService.logActivity({
    //   action: "TASK_DELETED",
    //   entity: "Task",
    //   entityId: req.params.id,
    //   userId: req.user.id,
    //   details: JSON.stringify({
    //     message: "Task deleted successfully"
    //   })
    // });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
