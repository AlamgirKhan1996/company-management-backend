// ─── src/routes/reportsRoutes.js ──────────────────────────────────────────────

import { Router } from "express";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import * as reportsController from "../controllers/reportsController.js";

const router = Router();

// ADMIN, SUPER_ADMIN, MANAGER can access all reports
const REPORT_ROLES = ["ADMIN", "SUPER_ADMIN", "MANAGER"];

// Only ADMIN and SUPER_ADMIN can see the raw audit trail
const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Analytics and reporting endpoints
 */

/**
 * @swagger
 * /api/reports/overview:
 *   get:
 *     summary: Company-wide KPI overview report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: "Start date (ISO 8601). Defaults to 30 days ago."
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: "End date (ISO 8601). Defaults to now."
 *     responses:
 *       200:
 *         description: Overview KPIs, task trends, AI summary, recent activity
 *       403:
 *         description: Access denied
 */
router.get(
  "/overview",
  authenticate,
  authorize(REPORT_ROLES),
  reportsController.getOverviewReport
);

/**
 * @swagger
 * /api/reports/projects:
 *   get:
 *     summary: Project analytics — status, health, completion rates, timelines
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project breakdown with health scores and timelines
 */
router.get(
  "/projects/health",
  authenticate,
  authorize(REPORT_ROLES),
  reportsController.getProjectsHealth
);

router.get(
  "/projects",
  authenticate,
  authorize(REPORT_ROLES),
  reportsController.getProjectsReport
);

/**
 * @swagger
 * /api/reports/tasks:
 *   get:
 *     summary: Task analytics — distribution, workload, trends, AI vs human ratio
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter tasks by project ID
 *     responses:
 *       200:
 *         description: Task summary, trend data, per-project and per-assignee breakdown
 */
router.get(
  "/tasks/trends",
  authenticate,
  authorize(REPORT_ROLES),
  reportsController.getTasksTrends
);

router.get(
  "/tasks",
  authenticate,
  authorize(REPORT_ROLES),
  reportsController.getTasksReport
);

/**
 * @swagger
 * /api/reports/employees:
 *   get:
 *     summary: Employee performance — productivity scores, task completion, overdue rates
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: Filter employees by department
 *     responses:
 *       200:
 *         description: Employee rankings, productivity scores, top performers
 */
router.get(
  "/employees",
  authenticate,
  authorize(REPORT_ROLES),
  reportsController.getEmployeePerformanceReport
);

/**
 * @swagger
 * /api/reports/departments:
 *   get:
 *     summary: Department analytics — task completion, project distribution, employee counts
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Per-department breakdown with task and project metrics
 */
router.get(
  "/departments",
  authenticate,
  authorize(REPORT_ROLES),
  reportsController.getDepartmentReport
);

/**
 * @swagger
 * /api/reports/activity:
 *   get:
 *     summary: Audit trail report — who did what, when (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter activity logs by user ID
 *     responses:
 *       200:
 *         description: Activity logs with action frequency, most active users, and timeline
 */
router.get(
  "/activity",
  authenticate,
  authorize(ADMIN_ROLES),
  reportsController.getActivityReport
);

/**
 * @swagger
 * /api/reports/ai:
 *   get:
 *     summary: AI analytics — AI employee productivity, task outcomes, trends
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: AI task breakdown, per-AI-employee stats, completion vs failure rate
 */
router.get(
  "/ai",
  authenticate,
  authorize(REPORT_ROLES),
  reportsController.getAIReport
);

/**
 * @swagger
 * /api/reports/export/tasks:
 *   get:
 *     summary: Export tasks report as CSV
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get(
  "/export/tasks",
  authenticate,
  authorize(REPORT_ROLES),
  reportsController.exportTasks
);

/**
 * @swagger
 * /api/reports/export/employees:
 *   get:
 *     summary: Export employee performance report as CSV
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get(
  "/export/employees",
  authenticate,
  authorize(REPORT_ROLES),
  reportsController.exportEmployees
);

export default router;
