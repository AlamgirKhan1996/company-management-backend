import { prisma } from "../prismaClient.js";

// Create User
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await prisma.user.create({
      data: { name, email, password, role }
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Users
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
