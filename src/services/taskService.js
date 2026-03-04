import prisma from "../utils/prismaClient.js";
export const createTask = async (data) => {
  const { title, description, status, dueDate, projectId, assignedToId } = data;

  if (!projectId || !assignedToId) {
    throw new Error("projectId and assignedToId are required");
  }

  return await prisma.task.create({
    data: {
      title,
      description,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      project: { connect: { id: projectId } },
      employee: { connect: { id: assignedToId } }
    },
    include: { project: true, employee: true },
  });
};

export const getAllTasks = async (projectId) => {
  const where = projectId ? { projectId } : {};
  return await prisma.task.findMany({
    where,
    include: {
      project: true,
      employee: true,
    },
    orderBy: {createdAt: "desc"},
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
    include: { project: true},
  });
};

export const deleteTask = async (id) => {
  return await prisma.task.delete({ where: { id } });
};