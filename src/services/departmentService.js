import prisma from "../utils/prismaClient.js";

export const getAllDepartments = async () => {
  return await prisma.department.findMany();
};

export const createDepartment = async (data) => {
  return await prisma.department.create({ data });
};
