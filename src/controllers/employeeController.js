import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../services/employeeService.js";
import * as activityService from "../services/activityService.js";
import logger from "../utils/logger.js";

export const createEmployeeController = async (req, res) => {
  try {
    const employee = await createEmployee(req.body);
    logger.info(`✅ Employee created successfully: ${employee.name} ID: ${employee.id} by user ${req.user.id}`);
    res.status(201).json({ message: "Employee created", employee });
  } catch (error) {
    logger.error(`❌ Error creating employee: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

export const getEmployeesController = async (req, res) => {
  try {
    const employees = await getAllEmployees();
    logger.info(`Get All Employees: ${employees.map(emp => emp.name)} ${employees.length} IDs: ${employees.map(emp => emp.id)}`);
    res.json(employees);
  } catch (error) {
    logger.error(`❌ Error getting all employees: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const getEmployeeByIdController = async (req, res) => {
  try {
    const employee = await getEmployeeById(req.params.id);
    await activityService.logActivity({
      action: "GET_EMPLOYEE_BY_ID",
      entity: "Employee",
      entityId: req.params.id,
      userId: req.user.id,
      details: JSON.stringify({
        employeeName: employee.name,
      })
    });
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    logger.info(`Get Employee By ID: ${employee.name} ID: ${employee.id} requested by user ${req.user.id}`);
    res.json(employee);
  } catch (error) {
    logger.error(`❌ Error getting employee by ID: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

export const updateEmployeeController = async (req, res) => {
  try {
    const employee = await updateEmployee(req.params.id, req.body);
    await activityService.logActivity({
      action: "UPDATE_EMPLOYEE",
      entity: "Employee",
      entityId: req.params.id,
      userId: req.user.id,
      details: JSON.stringify({
        name: employee.name,
      })
    });
    logger.info(`✅ Employee updated successfully: ${employee.name} ID: ${employee.id} by user ${req.user.id}`);
    res.json(employee);
  } catch (error) {
    logger.error(`❌ Error updating employee: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
};

export const deleteEmployeeController = async (req, res) => {
  try {
    await deleteEmployee(req.params.id);
    await activityService.logActivity({
      action: "DELETE_EMPLOYEE",
      entity: "Employee",
      entityId: req.params.id,
      userId: req.user.id,
      details: JSON.stringify({
        message: "Employee deleted successfully"
      })
    });
    logger.info(`✅ Employee deleted successfully: ID: ${req.params.id} by user ${req.user.id}`);
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    logger.error(`❌ Error deleting employee: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
