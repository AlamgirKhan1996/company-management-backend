import * as projectsService from "../services/projectService.js";
import * as activityService from "../services/activityService.js";
import { json } from "zod";

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

   await activityService.logActivity({
      action: "CREATE_PROJECT",
      entity: "Project",
      entityId: project.id,
      userId: req.user.id,
      details: JSON.stringify({
        name: project.name,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
      }),
    });

    res.status(201).json({ message: "Project created successfully", project });
  } catch (err) {
    next(err);
  }
};

// Get all projects
export const getProjects = async (req, res, next) => {
  try {
    const projects = await projectsService.getAllProjects();
    await activityService.getActivityLogs({
      action: "GET_PROJECT",
      entity: "GetProject"
    })
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

// Update project
export const updateProject = async (req, res, next) => {
  try {
    const project = await projectsService.updateProject(req.params.id, req.body);
    res.locals.updatedProject = project; // optional for logging
    res.status(200).json(project);
  } catch (err) {
    next(err);
  }
};

// Delete project
export const deleteProject = async (req, res, next) => {
  try {
    await projectsService.deleteProject(req.params.id);
    res.locals.deletedProjectId = req.params.id; // optional for logging
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    next(err);
  }
};
