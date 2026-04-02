import {
  registerUserService,
  loginUserService,
  registerCompanyService,
} from "../services/authService.js";
import logger from "../utils/logger.js";
import { Cache } from "../utils/cache.js";
import { CacheKeys } from "../utils/cacheKeys.js";

// ─── Register User ───────────────────────────────────────────────────────────
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await registerUserService(name, email, password, role);
    logger.info(`✅ User registered successfully: ${user.id}`);
    await Cache.del(CacheKeys.users.all);
    res.status(201).json({ message: "User registered", userId: user.id });
  } catch (err) {
    logger.error(`❌ Error registering user: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

// ─── Login User ──────────────────────────────────────────────────────────────
// BUG FIXED: service now returns { token, user } instead of touching res directly.
export const loginUser = async (req, res) => {
  try {
    const { email, password, companyId, companyEmail } = req.body;
    const { token, user } = await loginUserService({
      email,
      password,
      companyId,
      companyEmail,
    });

    logger.info(`✅ User logged in successfully: ${email}`);
    await Cache.del(CacheKeys.users.all);

    // Optional: set an HttpOnly cookie as well (good for browser clients)
    res.setHeader(
      "Set-Cookie",
      `token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`
    );

    // Always return JSON so API / mobile clients work too
    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    });
  } catch (err) {
    logger.error(`❌ Error logging in user: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

// ─── Register Company + Super Admin ─────────────────────────────────────────
export const registerCompany = async (req, res) => {
  try {
    const {
      companyName,
      companyEmail,
      phone,
      address,
      adminName,
      adminEmail,
      password,
    } = req.body;

    const { company, user, token } = await registerCompanyService({
      companyName,
      companyEmail,
      phone,
      address,
      adminName,
      adminEmail,
      password,
    });

    logger.info(
      `✅ Company registered: ${company.id}, admin: ${user.id}`
    );

    res.status(201).json({
      message: "Company registered successfully",
      companyId: company.id,
      userId: user.id,
      token,
    });
  } catch (err) {
    logger.error(`❌ Error registering company: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

// ─── Get current user ────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    logger.info(`✅ Fetched current user: ${user.email}`);
    res.json({ user });
  } catch (err) {
    logger.error(`❌ Error fetching current user: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ error: "Current password is incorrect" });

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};