// ─── src/controllers/reportsController.js ─────────────────────────────────────

import * as reportsService from "../services/reportsService.js";
import { Cache } from "../utils/cache.js";
import { CacheKeys } from "../utils/cacheKeys.js";
import logger from "../utils/logger.js";

// ─── Shared Utilities ─────────────────────────────────────────────────────────

const getCompanyId = (req) => req.companyId || req.user.companyId;

const extractFilters = (query) => {
  const { startDate, endDate, departmentId, projectId, userId } = query;
  return { startDate, endDate, departmentId, projectId, userId };
};

const cacheKey = (namespace, companyId, filters) =>
  `${namespace}:${companyId}:${JSON.stringify(filters)}`;

const CACHE_TTL = 60; // 60 seconds for all report endpoints

const sendReport = async (res, key, generator, logMsg) => {
  const cached = await Cache.get(key);
  if (cached) {
    logger.info(`📦 ${logMsg} — served from cache`);
    return res.status(200).json(JSON.parse(cached));
  }
  const data = await generator();
  const payload = {
    success: true,
    data,
    generatedAt: new Date().toISOString(),
  };
  await Cache.set(key, JSON.stringify(payload), CACHE_TTL);
  logger.info(`📊 ${logMsg}`);
  return res.status(200).json(payload);
};

// ─── 1. Overview Report ───────────────────────────────────────────────────────

export const getOverviewReport = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const filters = extractFilters(req.query);
    const key = CacheKeys.reports.overview(companyId, filters);
    await sendReport(
      res,
      key,
      () => reportsService.getOverviewReport(companyId, filters),
      `Overview report for company ${companyId}`
    );
  } catch (err) {
    logger.error(`❌ Overview report error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 2. Projects Report ───────────────────────────────────────────────────────

export const getProjectsReport = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const filters = extractFilters(req.query);
    const key = CacheKeys.reports.projects(companyId, filters);
    await sendReport(
      res,
      key,
      () => reportsService.getProjectsReport(companyId, filters),
      `Projects report for company ${companyId}`
    );
  } catch (err) {
    logger.error(`❌ Projects report error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 3. Tasks Report ──────────────────────────────────────────────────────────

export const getTasksReport = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const filters = extractFilters(req.query);
    const key = CacheKeys.reports.tasks(companyId, filters);
    await sendReport(
      res,
      key,
      () => reportsService.getTasksReport(companyId, filters),
      `Tasks report for company ${companyId}`
    );
  } catch (err) {
    logger.error(`❌ Tasks report error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 4. Employee Performance Report ──────────────────────────────────────────

export const getEmployeePerformanceReport = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const filters = extractFilters(req.query);
    const key = CacheKeys.reports.employees(companyId, filters);
    await sendReport(
      res,
      key,
      () => reportsService.getEmployeePerformanceReport(companyId, filters),
      `Employee performance report for company ${companyId}`
    );
  } catch (err) {
    logger.error(`❌ Employee report error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 5. Department Report ─────────────────────────────────────────────────────

export const getDepartmentReport = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const filters = extractFilters(req.query);
    const key = CacheKeys.reports.departments(companyId, filters);
    await sendReport(
      res,
      key,
      () => reportsService.getDepartmentReport(companyId, filters),
      `Department report for company ${companyId}`
    );
  } catch (err) {
    logger.error(`❌ Department report error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 6. Activity / Audit Report ───────────────────────────────────────────────

export const getActivityReport = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const filters = extractFilters(req.query);
    const key = CacheKeys.reports.activity(companyId, filters);
    await sendReport(
      res,
      key,
      () => reportsService.getActivityReport(companyId, filters),
      `Activity report for company ${companyId}`
    );
  } catch (err) {
    logger.error(`❌ Activity report error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 7. AI Analytics Report ───────────────────────────────────────────────────

export const getAIReport = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const filters = extractFilters(req.query);
    const key = CacheKeys.reports.ai(companyId, filters);
    await sendReport(
      res,
      key,
      () => reportsService.getAIReport(companyId, filters),
      `AI report for company ${companyId}`
    );
  } catch (err) {
    logger.error(`❌ AI report error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 8. Task Trends ───────────────────────────────────────────────────────────

export const getTasksTrends = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const filters = extractFilters(req.query);
    const key = cacheKey("reports:tasks:trends", companyId, filters);
    await sendReport(
      res,
      key,
      () => reportsService.getTasksTrends(companyId, filters),
      `Tasks trends for company ${companyId}`
    );
  } catch (err) {
    logger.error(`❌ Tasks trends error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 9. Projects Health ───────────────────────────────────────────────────────

export const getProjectsHealth = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const filters = extractFilters(req.query);
    const key = cacheKey("reports:projects:health", companyId, filters);
    await sendReport(
      res,
      key,
      () => reportsService.getProjectsHealth(companyId, filters),
      `Projects health for company ${companyId}`
    );
  } catch (err) {
    logger.error(`❌ Projects health error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─── 10. CSV Exports ──────────────────────────────────────────────────────────

export const exportTasks = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const filters = extractFilters(req.query);
    const csv = await reportsService.exportTasksCSV(companyId, filters);
    const filename = `tasks-report-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    logger.info(`📤 Tasks CSV export for company ${companyId}`);
    res.status(200).send(csv);
  } catch (err) {
    logger.error(`❌ Tasks export error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const exportEmployees = async (req, res) => {
  try {
    const companyId = getCompanyId(req);
    const filters = extractFilters(req.query);
    const csv = await reportsService.exportEmployeesCSV(companyId, filters);
    const filename = `employees-report-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    logger.info(`📤 Employees CSV export for company ${companyId}`);
    res.status(200).send(csv);
  } catch (err) {
    logger.error(`❌ Employees export error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
};
