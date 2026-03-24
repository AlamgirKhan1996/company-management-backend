import prisma from "../utils/prismaClient.js";

// BUG FIXED: Company model has no createdById field — removed it.
export const createCompany = async (name, email) => {
  return await prisma.company.create({
    data: { name, email },
  });
};

export const getCompanyById = async (id) => {
  return await prisma.company.findUnique({ where: { id } });
};

export const getAllCompanies = async () => {
  return await prisma.company.findMany({ orderBy: { createdAt: "desc" } });
};

export const updateCompany = async (id, name, email) => {
  return await prisma.company.update({
    where: { id },
    data: { name, email },
  });
};

export const deleteCompany = async (id) => {
  return await prisma.company.delete({ where: { id } });
};
