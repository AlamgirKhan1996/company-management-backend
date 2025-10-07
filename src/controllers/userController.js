import * as userService from "../services/userService.js";
import * as activityService from "../services/activityService.js";

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
    await activityService.logActivity({
      action: "USER_CREATED",
      entity: "User",
      entityId: user.id,
      userId: req.user.id,
      details: JSON.stringify({
        name: user.name,
        email: user.email,
        role: user.role
      })
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
    await activityService.logActivity({
      action: "GET_ALL_USERS",
      entity: "User",
      userId: req.user.id,
      details: JSON.stringify({
        userCount: users.length
      })
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};
export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    await activityService.logActivity({
      action: "GET_USER_BY_ID",
      entity: "User",
      entityId: req.params.id,
      userId: req.user.id,
      details: JSON.stringify({
        userName: user.name,
        userEmail: user.email,
        userRole: user.role
      })
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const user = await userService.updateUser(id, data);
    await activityService.logActivity({
      action: "USER_UPDATED",
      entity: "User",
      entityId: user.id,
      userId: req.user.id,
      details: JSON.stringify({
        name: user.name,
        email: user.email,
        role: user.role
      })
    });
    res.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    await activityService.logActivity({
      action: "USER_DELETED",
      entity: "User",
      entityId: req.params.id,
      userId: req.user.id,
      details: JSON.stringify({
        message: "User deleted successfully"
      })
    });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

