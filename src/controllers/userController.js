import * as userService from "../services/userService.js";

// Create User
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await userService.createUser({
      name,
      email,
      password,
      role
    });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

// Get All Users
export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};
