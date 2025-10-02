import prisma from "../utils/prismaClient.js";

export const getAllTasks = async () => {
  return await prisma.task.findMany({
    include: { project: true, assignedTo: true },
  });
};

export const createTask = async (data) => {
  return await prisma.task.create({
    data,
    include: { project: true, assignedTo: true },
  });
};

export const getTaskById = async (id) => {
  return await prisma.task.findUnique({
    where: { id },
    include: { project: true, assignedTo: true },
  });
};

export const updateTask = async (id, data) => {
  return await prisma.task.update({
    where: { id },
    data,
    include: { project: true, assignedTo: true },
  });
};

export const deleteTask = async (id) => {
  return await prisma.task.delete({ where: { id } });
};