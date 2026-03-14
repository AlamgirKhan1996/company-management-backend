import prisma from "../utils/prismaClient.js";
export const createTask = async (data, companyId) => {
  const { title, description, status, dueDate, projectId, assignedToId } = data;

  if (!projectId || !assignedToId) {
    throw new Error("projectId and assignedToId are required");
  }

  const [project, employee] = await Promise.all([
    prisma.project.findFirst({ where: { id: projectId, companyId } }),
    prisma.employee.findFirst({ where: { id: assignedToId, companyId } }),
  ]);

  if (!project || !employee) {
    throw new Error("Project or employee does not belong to your company");
  }

  return await prisma.task.create({
    data: {
      title,
      description,
      status,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      project: { connect: { id: projectId } },
      employee: { connect: { id: assignedToId } },
      company: { connect: { id: companyId } },
      companyId,
    },
    include: { project: true, employee: true },
  });
};

export const getAllTasks = async (projectId, companyId) => {
  const where = projectId ? { projectId, companyId } : { companyId };
  return await prisma.task.findMany({
    where: {companyId: req.user.companyId},
    orderBy: {createdAt: "desc"},
    });
};


export const getTaskById = async (id, companyId) => {
  return await prisma.task.findFirst({
    where: { id, companyId },
    include: { project: true, employee: true },
  });
};

export const updateTask = async (id, data) => {
  return await prisma.task.update({
    where: { id },
    data,
    include: { project: true, employee: true },
  });
};

export const deleteTask = async (id, companyId) => {
  return await prisma.task.deleteMany({
    where: { id, companyId },
  });
};