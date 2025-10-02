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
