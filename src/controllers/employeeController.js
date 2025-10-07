import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../services/employeeService.js";
import * as activityService from "../services/activityService.js";

export const createEmployeeController = async (req, res) => {
  try {
    const employee = await createEmployee(req.body);
    await activityService.logActivity({
      action: "CREATE_EMPLOYEE",
      entity: "Employee",
      entityId: employee.id,
      userId: req.user.id,
      details: JSON.stringify({
        name: employee.name,
      })
    });
    res.status(201).json({ message: "Employee created", employee });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getEmployeesController = async (req, res) => {
  try {
    const employees = await getAllEmployees();
      await activityService.logActivity({
      action: "GET_ALL_EMPLOYEES",
      entity: "Employee",
      userId: req.user.id,
      details: JSON.stringify({
        employeeCount: employees.length
      })
    });
    res.json(employees);
  } catch (error) {
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
    res.json(employee);
  } catch (error) {
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
    res.json(employee);
  } catch (error) {
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
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
