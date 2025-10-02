import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from "../services/employeeService.js";

export const createEmployeeController = async (req, res) => {
  try {
    const employee = await createEmployee(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getEmployeesController = async (req, res) => {
  try {
    const employees = await getAllEmployees();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEmployeeByIdController = async (req, res) => {
  try {
    const employee = await getEmployeeById(req.params.id);
    if (!employee) return res.status(404).json({ error: "Employee not found" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateEmployeeController = async (req, res) => {
  try {
    const employee = await updateEmployee(req.params.id, req.body);
    res.json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteEmployeeController = async (req, res) => {
  try {
    await deleteEmployee(req.params.id);
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
