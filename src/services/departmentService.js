import prisma from "../utils/prismaClient.js";

// Get all departments
export const getAllDepartments = async () => {
  return await prisma.department.findMany({
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
export const createDepartment = async (name, createdById) => {
  return await prisma.department.create({
    data: {
      name,
      createdById, // just assign the user id directly
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
