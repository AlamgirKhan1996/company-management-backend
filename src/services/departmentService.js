import { id } from "zod/locales";
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
      createdBy: { connect: { id: createdById } },
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
export const updateDepartment = async (id, name) => {

  return await prisma.department.update({
    where: { id },
    data: { name },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, role: true },
      },
      employees: true,
      projects: true,
    },
  });
};
export const deleteDepartment = async (id) => {
  return await prisma.department.delete({ where: { id } });
};
