import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../services/taskService.js";

export const createTaskController = async (req, res) => {
  try {
    const task = await createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getTasksController = async (req, res) => {
  try {
    const tasks = await getTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTaskByIdController = async (req, res) => {
  try {
    const task = await getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTaskController = async (req, res) => {
  try {
    const task = await updateTask(req.params.id, req.body);
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteTaskController = async (req, res) => {
  try {
    await deleteTask(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
