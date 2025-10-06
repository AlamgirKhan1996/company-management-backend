import * as projectsService from "../services/projectService.js";
import * as activityService from "../services/activityService.js";

// Create Project
export const createProject = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, status, departmentIds = [], userId } = req.body;
    if (!Array.isArray(departmentIds)) {
      if (departmentIds) {
        departmentIds = [departmentIds]; // convert single value to array
      } else {
        departmentIds = []; // default empty
      }
    }

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
      details: `Project ${project.name} created`,
      entityId: project.id,
      entityType: "PROJECT",
      userId: req.user.id
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
    await activityService.logActivity({
      action: "VIEW_PROJECTS",
      entity: "Project",
      userId: req.user.id
    });
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await projectsService.updateProject(req.params.id, req.body);
    await activityService.logActivity({
      action: "UPDATE_PROJECT",
      entity: "Project",
      entityId: project.id,
      performedBy: { connect: { id: String(req.user.id) } },
      details: `Project ${project.name} updated`,
      userId: req.user.id
    });
    return res.json(project);
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    await projectsService.deleteProject(req.params.id);
    await activityService.logActivity({
      action: "DELETE_PROJECT",
      entity: "Project",
      entityId: req.params.id,
      performedBy: { connect: { id: String(req.user.id) } },
      details: `Project with ID ${req.params.id} deleted`,
      userId: req.user.id
    });
    return res.json({ message: "Project deleted successfully" });
  } catch (err) {
    next(err);
  }
};
