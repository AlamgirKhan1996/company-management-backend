import * as departmentService from "../services/departmentService.js";
import logger from "../utils/logger.js";
import { Cache } from "../utils/cache.js";
import { CacheKeys } from "../utils/cacheKeys.js";

// ✅ Create Department
export const createDepartment = async (req, res, next) => {
  try {
    const { name } = req.body;
    const createdById = req.user.id;
    // ✅ call service with TWO arguments, not an object
    const department = await departmentService.createDepartment(name, createdById);
    logger.info(`✅ Department created successfully: ${department.name} ID: ${department.id} by user ${createdById}`);
    await Cache.del(CacheKeys.departments.all);
    res.status(201).json(department);
  } catch (err) {
    logger.error(`❌ Error creating department: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get All Departments
export const getDepartments = async (req, res) => {
  try {
    

    // 1️⃣ Check if data exists in cache
    const cached = await Cache.get(CacheKeys.departments.all);
    if (cached) {
      logger.info("📦 Department fetched from cache");
      return res.status(200).json(JSON.parse(cached));
    }

    const departments = await departmentService.getAllDepartments();
    await Cache.set(CacheKeys.departments.all, departments, 300); // Cache for 5 minutes
    logger.info("🧠 Fresh data fetched and cached");
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
    await Cache.del(CacheKeys.departments.all);
    await Cache.del(CacheKeys.departments.one(id));
    return res.status(200).json(updatedDepartment);
  } catch (error) {
    logger.error(`❌ Error updating department: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await departmentService.deleteDepartment(id);
    logger.info(`✅ Department deleted successfully: ID: ${id} by user ${req.user.id}`);
    await Cache.del(CacheKeys.departments.all);
    await Cache.del(CacheKeys.departments.one(id));
    return res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    logger.error(`❌ Error deleting department: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};
