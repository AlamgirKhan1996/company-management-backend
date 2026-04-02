// ─── src/controllers/userController.js ──────────────────────────────────────
// CRITICAL FIX: All queries now filter by companyId
// Previously returned ALL users from ALL companies — major security vulnerability

import prisma from "../utils/prismaClient.js";
import logger from "../utils/logger.js";
import { Cache } from "../utils/cache.js";

// ─── GET all users for THIS company only ─────────────────────────────────────
export const getUsers = async (req, res) => {
  try {
    // ✅ Always scope to the authenticated user's company
    const companyId = req.companyId || req.user.companyId;

    if (!companyId) {
      return res.status(400).json({ error: "Company context required" });
    }

    const cacheKey = `users:${companyId}`;
    const cached = await Cache.get(cacheKey);
    if (cached) {
      logger.info(`📦 Users fetched from cache for company ${companyId}`);
      return res.status(200).json(JSON.parse(cached));
    }

    const users = await prisma.user.findMany({
      where: {
        companyId, // ✅ THE FIX — scope to company
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // ✅ Never return password hash
      },
      orderBy: { createdAt: "desc" },
    });

    await Cache.set(cacheKey, JSON.stringify(users), 60);
    logger.info(`👥 Users fetched: ${users.length} for company ${companyId}`);
    res.status(200).json(users);
  } catch (err) {
    logger.error(`❌ Get users error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// ─── GET single user ──────────────────────────────────────────────────────────
export const getUserById = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const { id } = req.params;

    const user = await prisma.user.findFirst({
      where: { id, companyId }, // ✅ scope to company
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    logger.error(`❌ Get user by ID error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// ─── UPDATE user role (Admin only) ───────────────────────────────────────────
export const updateUserRole = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["ADMIN", "MANAGER", "EMPLOYEE"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Can't change SUPER_ADMIN role
    const existing = await prisma.user.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return res.status(404).json({ error: "User not found" });
    }

    if (existing.role === "SUPER_ADMIN") {
      return res.status(403).json({ error: "Cannot modify Super Admin role" });
    }

    // Can't demote yourself
    if (existing.id === req.user.id) {
      return res.status(403).json({ error: "Cannot change your own role" });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    // Bust cache
    await Cache.del(`users:${companyId}`);

    logger.info(`✅ User role updated: ${updated.email} → ${role} by ${req.user.id}`);
    res.status(200).json(updated);
  } catch (err) {
    logger.error(`❌ Update user role error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

// ─── DELETE user (Admin only) ─────────────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    const companyId = req.companyId || req.user.companyId;
    const { id } = req.params;

    // Can't delete yourself
    if (id === req.user.id) {
      return res.status(403).json({ error: "Cannot delete your own account" });
    }

    const existing = await prisma.user.findFirst({
      where: { id, companyId },
    });

    if (!existing) {
      return res.status(404).json({ error: "User not found" });
    }

    if (existing.role === "SUPER_ADMIN") {
      return res.status(403).json({ error: "Cannot delete Super Admin" });
    }

    await prisma.user.delete({ where: { id } });
    await Cache.del(`users:${companyId}`);

    logger.info(`✅ User deleted: ${existing.email} by ${req.user.id}`);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    logger.error(`❌ Delete user error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};
