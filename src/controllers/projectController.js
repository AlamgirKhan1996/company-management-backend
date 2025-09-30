import { prisma } from "../prismaClient.js";

// Create Project
export const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, departmentIds, userId } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status,
        createdBy: { connect: { id: userId } },
        departments: { connect: departmentIds.map(id => ({ id })) },
      },
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all projects
export const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { departments: true, createdBy: true },
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
