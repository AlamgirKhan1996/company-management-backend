import * as departmentService from "../services/departmentService.js";
import * as activityService from "../services/activityService.js";
import logger from "../utils/logger.js";

// ✅ Create Department
export const createDepartment = async (req, res, next) => {
  try {
    const { name } = req.body;
    const createdById = req.user.id;
    // ✅ call service with TWO arguments, not an object
    const department = await departmentService.createDepartment(name, createdById);
    logger.info(`✅ Department created successfully: ${department.name} ID: ${department.id} by user ${createdById}`);
    res.status(201).json(department);
  } catch (err) {
    logger.error(`❌ Error creating department: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get All Departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await departmentService.getAllDepartments();
    logger.info(`Get All Departments: ${departments.map(dept => dept.name)} ${departments.length} IDs: ${departments.map(dept => dept.id)}`);
    res.json(departments);
  } catch (err) {
    logger.error(`❌ Error getting all departments: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedDepartment = await departmentService.updateDepartment(id, name);

    logger.info(`✅ Department updated successfully: ${updatedDepartment.name} ID: ${updatedDepartment.id} by user ${req.user.id}`);
    return res.status(200).json(updatedDepartment);
  } catch (error) {
    logger.error(`❌ Error updating department: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};
export const deleteDepartment = async (req, res) => {
  try {
    await departmentService.deleteDepartment(req.params.id);
    logger.info(`✅ Department deleted successfully: ID: ${req.params.id} by user ${req.user.id}`);
    return res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    logger.error(`❌ Error deleting department: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};
