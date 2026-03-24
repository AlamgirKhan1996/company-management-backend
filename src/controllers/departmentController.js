import * as departmentService from "../services/departmentService.js";
import logger from "../utils/logger.js";
import { Cache } from "../utils/cache.js";
import { CacheKeys } from "../utils/cacheKeys.js";

// ─── Create Department ───────────────────────────────────────────────────────
// BUG FIXED: companyId was extracted from req but never passed to the service.
export const createDepartment = async (req, res, next) => {
  try {
    const { name } = req.body;
    const createdById = req.user.id;
    const companyId = req.companyId || req.user.companyId;

    const department = await departmentService.createDepartment(
      name,
      createdById,
      companyId   // ← was missing before
    );

    logger.info(
      `✅ Department created: ${department.name} ID: ${department.id} by user ${createdById}`
    );
    await Cache.del(CacheKeys.departments.all);
    res.status(201).json(department);
  } catch (err) {
    logger.error(`❌ Error creating department: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// ─── Get All Departments ─────────────────────────────────────────────────────
export const getDepartments = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;

    const cached = await Cache.get(CacheKeys.departments.all + ":" + companyId);
    if (cached) {
      logger.info("📦 Departments fetched from cache");
      return res.status(200).json(JSON.parse(cached));
    }

    const departments = await departmentService.getAllDepartments(companyId);
    await Cache.set(
      CacheKeys.departments.all + ":" + companyId,
      JSON.stringify(departments),
      300
    );
    logger.info(
      `Get All Departments: ${departments.length} results for company ${companyId}`
    );
    res.json(departments);
  } catch (err) {
    logger.error(`❌ Error getting departments: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// ─── Update Department ───────────────────────────────────────────────────────
export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const companyId = req.companyId || req.user.companyId;

    const updatedDepartment = await departmentService.updateDepartment(
      id,
      name,
      companyId
    );

    logger.info(
      `✅ Department updated: ${updatedDepartment.name} ID: ${updatedDepartment.id} by user ${req.user.id}`
    );
    await Cache.del(CacheKeys.departments.all + ":" + companyId);
    await Cache.del(CacheKeys.departments.one(id));
    return res.status(200).json(updatedDepartment);
  } catch (error) {
    logger.error(`❌ Error updating department: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};

// ─── Delete Department ───────────────────────────────────────────────────────
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId || req.user.companyId;

    await departmentService.deleteDepartment(id, companyId);
    logger.info(
      `✅ Department deleted: ID: ${id} by user ${req.user.id}`
    );
    await Cache.del(CacheKeys.departments.all + ":" + companyId);
    await Cache.del(CacheKeys.departments.one(id));
    return res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    logger.error(`❌ Error deleting department: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};
