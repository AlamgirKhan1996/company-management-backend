import * as aiService from "../services/aiEmployeeService.js";
import logger from "../utils/logger.js";

export const createAIEmployee = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const agent = await aiService.createAIEmployee(req.body, companyId);
    logger.info(`✅ AI Employee created: ${agent.name} | Role: ${agent.role}`);
    res.status(201).json(agent);
  } catch (err) {
    logger.error(`❌ Create AI Employee failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

export const getAllAIEmployees = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const agents = await aiService.getAllAIEmployees(companyId);
    res.json(agents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const assignTask = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const { id: agentId } = req.params;

    const taskData = {
      ...req.body,
      assignedById: req.user.id,
    };

    const result = await aiService.executeTask(agentId, taskData, companyId);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`❌ Assign task failed: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

export const getAgentTasks = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const { id: agentId } = req.params;
    const tasks = await aiService.getAIEmployeeTasks(agentId, companyId);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};