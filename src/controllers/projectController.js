import * as projectsService from "../services/projectService.js";
import * as activityService from "../services/activityService.js";
import { json } from "zod";
import logger from "../utils/logger.js";
import redis from "../config/redisClient.js";

// Create Project
export const createProject = async (req, res, next) => {
  try {
    let { name, description, startDate, endDate, status, departmentIds = [], userId } = req.body;

    if (!Array.isArray(departmentIds)) {
      if (departmentIds) {
        departmentIds = [departmentIds]; // convert single value to array
      } else {
        departmentIds = []; // default empty
      }
    }

    // Create the project
    const project = await projectsService.createProject({
      name,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      status,
      createdBy: { connect: { id: String(userId) } },
      departments: { connect: departmentIds.length ? departmentIds.map(id => ({ id: String(id) })) : [] },
    });
    logger.info(`✅ Project created successfully: ${project.name} ID: ${project.id} by user${userId} department ${departmentIds}`);
    await redis.del("ProjectCache");
    res.status(201).json({ message: "Project created successfully", project });
  } catch (err) {
    logger.error(`error creating project${err.message}`)
    await redis.del("ProjectCache");
    next(err);
  }
};

// Get all projects
export const getProjects = async (req, res, next) => {
  try {
    const projects = await projectsService.getAllProjects();
    logger.info(`Get All Projects: ${projects.map(project => project.name)} ${projects.length} IDs: ${projects.map(project => project.id)}`);
    res.json(projects);
  } catch (err) {
    logger.error(`error get all projects: ${err.message}`)
    await redis.del("ProjectCache");
    next(err);
  }
};

// Update project
export const updateProject = async (req, res, next) => {
  try {
    const project = await projectsService.updateProject(req.params.id, req.body);
    await activityService.logActivity({ 
      action: "UPDATE_PROJECT",
      entity: "Project",
      entityId: project.id,
      userId: req.user.id,
      details: JSON.stringify({
        name: project.name,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
      })
    });
    logger.info(`✅ Project updated successfully: ${project.name} ID: ${project.id} by user ${req.user?.id || "unknown"}`);
    await redis.del("ProjectCache");
    res.locals.updatedProject = project; // optional for logging
    res.status(200).json(project);
  } catch (err) {
    logger.error(`❌ Error updating project: ${err.message}`);
    await redis.del("ProjectCache");
    next(err);
  }
};

// Delete project
export const deleteProject = async (req, res, next) => {
  try {
    await projectsService.deleteProject(req.params.id);
    await activityService.logActivity({
      action: "DELETE_PROJECT",
      entity: "Project",
      entityId: req.params.id,
      userId: req.user.id,
      details: JSON.stringify({
        message: "Project deleted successfully"
      })
    });
    logger.info(`✅ Project deleted successfully: ID: ${req.params.id} by user ${req.user?.id || "unknown"}`);
    await redis.del("ProjectCache");
    res.locals.deletedProjectId = req.params.id; // optional for logging
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    logger.error(`❌ Error deleting project: ${err.message}`);
    await redis.del("ProjectCache");
    next(err);
  }
};
