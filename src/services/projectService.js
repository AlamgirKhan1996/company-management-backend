import prisma from "../utils/prismaClient.js";

export const getAllProjects = async () => {
  return await prisma.project.findMany({
    include: { departments: true, tasks: true },
  });
};

export const createProject = async (data) => {
  return await prisma.project.create({
    data,
    include: { departments: true },
  });
};
export const updateProject = async (id, data) => {
  return await prisma.project.update({
    where: { id },
    data,
    include: { departments: true },
  });
};
export const deleteProject = async (id) => {
  return await prisma.project.delete({
    where: { id },
    include: { departments: true },
  });
};