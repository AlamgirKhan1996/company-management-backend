import { registerUserService, loginUserService } from "../services/authService.js";
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
    const { email, password } = req.body;
    const { token } = await loginUserService(email, password);
    logger.info(`✅ User logged in successfully: ${email}`);
    await Cache.del(CacheKeys.users.all);
    res.json({ token });
  } catch (err) {
    logger.error(`❌ Error logging in user: ${err.message}`);
    await Cache.del(CacheKeys.users.all);
    res.status(400).json({ error: err.message });
  }
};
