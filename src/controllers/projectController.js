import * as projectsService from "../services/projectService.js";

// Create Project
export const createProject = async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, status, departmentIds, userId } = req.body;

    const project = await projectsService.createProject({
      name,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      status,
      createdBy: { connect: { id: userId } },
      departments: { connect: departmentIds.map(id => ({ id })) },
    });

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

// Get all projects
export const getProjects = async (req, res, next) => {
  try {
    const projects = await projectsService.getAllProjects();
    res.json(projects);
  } catch (err) {
    next(err);
  }
};
