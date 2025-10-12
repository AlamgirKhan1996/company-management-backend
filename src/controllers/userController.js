import * as userService from "../services/userService.js";
import * as activityService from "../services/activityService.js";
import logger from "../utils/logger.js";

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
    // await activityService.logActivity({
    //   action: "USER_CREATED",
    //   entity: "User",
    //   entityId: user.id,
    //   userId: req.user.id,
    //   details: JSON.stringify({
    //     name: user.name,
    //     email: user.email,
    //     role: user.role
    //   })
    // });
    logger.info(`✅ User created successfully: ${user.name} ID: ${user.id} by user ${req.user.id}`);
    res.status(201).json(user);
  } catch (err) {
    logger.error(`❌ Error creating user: ${err.message}`);
    next(err);
  }
};

// Get All Users
export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    // await activityService.logActivity({
    //   action: "GET_ALL_USERS",
    //   entity: "User",
    //   userId: req.user.id,
    //   details: JSON.stringify({
    //     userCount: users.length
    //   })
    // });
    logger.info(`Get All Users: ${users.map(user => user.name)} ${users.length} IDs: ${users.map(user => user.id)}`);
    res.json(users);
  } catch (err) {
    logger.error(`❌ Error getting all users: ${err.message}`);
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
    logger.info(`Get User By ID: ${user.name} ID: ${user.id} requested by user ${req.user.id}`);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    logger.error(`❌ Error getting user by ID: ${err.message}`);
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
    logger.info(`✅ User updated successfully: ${user.name} ID: ${user.id} by user ${req.user.id}`);
    res.json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    logger.error(`❌ Error updating user: ${error.message}`);
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
    logger.info(`✅ User deleted successfully: ID: ${req.params.id} by user ${req.user.id}`);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    logger.error(`❌ Error deleting user: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

