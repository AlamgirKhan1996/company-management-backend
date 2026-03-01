import prisma from "../utils/prismaClient.js";

export const getAllProjects = async () => {
  return await prisma.project.findMany({
    include: { departments: true, tasks: true, createdBy: true },
  });
};

export const createProject = async (data, userId) => {
  return await prisma.project.create({
    data : {
      ...data,
      createdById: userId,
    },
    include: { departments: true, createdBy: true },
  });
};
export const updateProject = async (id, data) => {
  return await prisma.project.update({
    where: { id },
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate? new Date(data.endDate) : null,
      createdById: data.createdById,
    },
    include: { departments: true },
  });
};
export const deleteProject = async (id) => {
  return await prisma.project.delete({
    where: { id },
    include: { departments: true },
  });
};