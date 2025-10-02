import * as departmentService from "../services/departmentService.js";

// Create Department
export const createDepartment = async (req, res) => {
  try {
    const { name, userId } = req.body;
    const department = await departmentService.createDepartment({
      name,
      createdBy: { connect: { id: userId } }
    });
    res.status(201).json(department);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await departmentService.getAllDepartments();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
