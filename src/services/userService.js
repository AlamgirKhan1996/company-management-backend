import prisma from "../utils/prismaClient.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });
};

export const createUser = async (data) => {
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return await prisma.user.create({
    data: { ...data, password: hashedPassword },
  });
};

export const getUserByEmail = async (email) => {
  return await prisma.user.findUnique({ where: { email } });
};
