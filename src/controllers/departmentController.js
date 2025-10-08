import * as departmentService from "../services/departmentService.js";
import * as activityService from "../services/activityService.js";

// ✅ Create Department
export const createDepartment = async (req, res, next) => {
  try {
    const { name } = req.body;
    const createdById = req.user.id;
    // ✅ call service with TWO arguments, not an object
    const department = await departmentService.createDepartment(name, createdById);

    res.status(201).json(department);
  } catch (err) {
    console.error("Create Department Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get All Departments
export const getDepartments = async (req, res) => {
  try {
    const departments = await departmentService.getAllDepartments();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedDepartment = await departmentService.updateDepartment(id, name);
    await activityService.logActivity({
      action: "UPDATE_DEPARTMENT",
      entity: "Department",
      entityId: updatedDepartment.id,
      userId: req.user.id,
      details: JSON.stringify({
        name: updatedDepartment.name,
        description: updatedDepartment.description,
      })
    });
    res.json({
      success: true,
      message: "Department updated successfully",
      department: updatedDepartment,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteDepartment = async (req, res) => {
  try {
    await departmentService.deleteDepartment(req.params.id);
    await activityService.logActivity({
      action: "DELETE_DEPARTMENT",
      entity: "Department",
      entityId: req.params.id,
      userId: req.user.id,
      details: JSON.stringify({
        message: "Department deleted successfully"
      })
    });
    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
