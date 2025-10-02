import prisma from "../utils/prismaClient.js";

export const getAllEmployees = async () => {
  return await prisma.employee.findMany({
    include: { department: true, tasks: true },
  });
};

export const createEmployee = async (data) => {
  return await prisma.employee.create({
    data,
    include: { department: true },
  });
};

export const getEmployeeByEmail = async (email) => {
  return await prisma.employee.findUnique({ where: { email } });
};

export const getEmployeeById = async (id) => {
  return await prisma.employee.findUnique({
    where: { id },
    include: { department: true, tasks: true },
  });
};

export const updateEmployee = async (id, data) => {
  return await prisma.employee.update({
    where: { id },
    data,
    include: { department: true, tasks: true },
  });
};

export const deleteEmployee = async (id) => {
  return await prisma.employee.delete({ where: { id } });
};
