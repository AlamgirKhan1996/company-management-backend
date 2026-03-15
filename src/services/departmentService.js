import prisma from "../utils/prismaClient.js";

// Get all departments
export const getAllDepartments = async (companyId) => {
  return await prisma.department.findMany({
    where: { companyId },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      employees: true,
      projects: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// Create department
export const createDepartment = async (name, createdById, companyId) => {
  return await prisma.department.create({
    data: {
      name,
      createdById,
      companyId
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      employees: true,
      projects: true,
    },
  });
};
export const updateDepartment = async (id, name, companyId) => {

  return await prisma.department.update({
    where: { id },
    data: { name, companyId },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      employees: true,
      projects: true,
    },
  });
};
export const deleteDepartment = async (id, companyId) => {
  return await prisma.department.deleteMany({
    where: { id, companyId },
  });
};
