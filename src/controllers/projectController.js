import * as projectsService from "../services/projectService.js";

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

    res.status(201).json({ message: "Project created successfully", project });
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
