import prisma from "../utils/prismaClient.js";

export const getAllEmployees = async (companyId) => {
  return await prisma.employee.findMany({
    where: { companyId },
    include: { department: true, tasks: true },
  });
};

export const createEmployee = async (data, companyId) => {
  return await prisma.employee.create({
    data: {
      ...data,
      companyId,
    },
    include: { department: true },
  });
};

export const getEmployeeByEmail = async (email, companyId) => {
  return await prisma.employee.findFirst({
    where: { email, companyId },
  });
};

export const getEmployeeById = async (id, companyId) => {
  return await prisma.employee.findFirst({
    where: { id, companyId },
    include: { department: true, tasks: true },
  });
};

export const updateEmployee = async (id, data, companyId) => {
  return await prisma.employee.update({
    where: { id },
    data: {
      ...data,
      companyId,
    },
    data,
    include: { department: true, tasks: true },
  });
};

export const deleteEmployee = async (id, companyId) => {
  return await prisma.employee.deleteMany({
    where: { id, companyId },
  });
};
