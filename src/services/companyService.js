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

export const getCompanyById = async (id) => {
  return await prisma.company.findUnique({
    where: { id },
  });
};

export const getAllCompanies = async () => {
  return await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
  });
};