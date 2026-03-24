import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../services/employeeService.js";
import * as activityService from "../services/activityService.js";
import logger from "../utils/logger.js";
import { Cache } from "../utils/cache.js";
import { CacheKeys } from "../utils/cacheKeys.js";

export const createEmployeeController = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const employee = await createEmployee(req.body, companyId);
    logger.info(
      `✅ Employee created: ${employee.name} ID: ${employee.id} by user ${req.user.id}`
    );
    await Cache.del(CacheKeys.employees.all);
    res.status(201).json({ message: "Employee created", employee });
  } catch (error) {
    logger.error(`❌ Error creating employee: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

export const getEmployeesController = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const employees = await getAllEmployees(companyId);
    logger.info(`Get All Employees: ${employees.length} for company ${companyId}`);
    res.json(employees);
  } catch (error) {
    logger.error(`❌ Error getting employees: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const getEmployeeByIdController = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const employee = await getEmployeeById(req.params.id, companyId);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    logger.info(
      `Get Employee: ${employee.name} ID: ${employee.id} by user ${req.user.id}`
    );
    res.json(employee);
  } catch (error) {
    logger.error(`❌ Error getting employee: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// BUG FIXED: companyId was not forwarded to the updateEmployee service call.
export const updateEmployeeController = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const employee = await updateEmployee(req.params.id, req.body, companyId);
    await activityService.logActivity(
      {
        action: "UPDATE_EMPLOYEE",
        entity: "Employee",
        entityId: req.params.id,
        userId: req.user.id,
        details: JSON.stringify({ name: employee.name }),
      },
      companyId
    );
    logger.info(
      `✅ Employee updated: ${employee.name} ID: ${employee.id} by user ${req.user.id}`
    );
    await Cache.del(CacheKeys.employees.all);
    res.json(employee);
  } catch (error) {
    logger.error(`❌ Error updating employee: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

export const deleteEmployeeController = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    await deleteEmployee(req.params.id, companyId);
    await activityService.logActivity(
      {
        action: "DELETE_EMPLOYEE",
        entity: "Employee",
        entityId: req.params.id,
        userId: req.user.id,
        details: JSON.stringify({ message: "Employee deleted" }),
      },
      companyId
    );
    logger.info(`✅ Employee deleted: ID: ${req.params.id} by user ${req.user.id}`);
    await Cache.del(CacheKeys.employees.all);
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    logger.error(`❌ Error deleting employee: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
