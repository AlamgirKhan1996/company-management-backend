import {
  registerUserService,
  loginUserService,
  registerCompanyService,
} from "../services/authService.js";
import logger from "../utils/logger.js";
import { Cache } from "../utils/cache.js";
import { CacheKeys } from "../utils/cacheKeys.js";
// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await registerUserService(name, email, password, role);
    logger.info(`✅ User registered successfully: ${user.id}`);
    await Cache.del(CacheKeys.users.all);
    res.status(201).json({ message: "User registered", userId: user.id });
  } catch (err) {
    logger.error(`❌ Error registering user: ${err.message}`);
    await Cache.del(CacheKeys.users.all);
    res.status(400).json({ error: err.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password, companyId, companyEmail } = req.body;
    const { token } = await loginUserService({ email, password, companyId, companyEmail });
    logger.info(`✅ User logged in successfully: ${email}`);
    await Cache.del(CacheKeys.users.all);
    res.json({ token });
  } catch (err) {
    logger.error(`❌ Error logging in user: ${err.message}`);
    await Cache.del(CacheKeys.users.all);
    res.status(400).json({ error: err.message });
  }
};

// Register Company + Super Admin
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

    logger.info(`✅ Company registered successfully: ${company.id}, admin user: ${user.id}`);
    res.status(201).json({
      message: "Company registered",
      companyId: company.id,
      userId: user.id,
      token,
    });
  } catch (err) {
    logger.error(`❌ Error registering company: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    logger.info(`✅ Fetched current user: ${user.email}`);
    await Cache.del(CacheKeys.users.all);
    res.json({ user });
  } catch (err) {
    logger.error(`❌ Error fetching current user: ${err.message}`);
    await Cache.del(CacheKeys.users.all);
    res.status(500).json({ error: err.message });
  }
};