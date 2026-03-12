import prisma from "../utils/prismaClient.js";

export const getAllProjects = async (companyId) => {
  return await prisma.project.findMany({
    where: { companyId },
    include: { departments: true, tasks: true, createdBy: true },
  });
};

export const createProject = async ({
  name,
  description,
  startDate,
  endDate,
  status,
  departmentIds,
  userId,
  companyId,
}) => {
  if (departmentIds && departmentIds.length) {
    const validDepartments = await prisma.department.findMany({
      where: {
        id: { in: departmentIds.map((id) => String(id)) },
        companyId,
      },
      select: { id: true },
    });

    if (validDepartments.length !== departmentIds.length) {
      throw new Error("One or more departments do not belong to your company");
    }
  }

  return await prisma.project.create({
    data: {
      name,
      description,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      status,
      company: { connect: { id: companyId } },
      companyId,
      departments: {
        connect: departmentIds.length
          ? departmentIds.map((id) => ({ id: String(id) }))
          : [],
      },
      createdBy: { connect: { id: userId } },
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