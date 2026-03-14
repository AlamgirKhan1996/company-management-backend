import prisma from "../utils/prismaClient";
export const createCompany = async (name, email, createdById) => {
  return await prisma.company.create({
    data: {
      name,
      email,
      createdById,
    },
  });
};