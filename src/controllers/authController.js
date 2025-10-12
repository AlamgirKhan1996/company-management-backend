import { registerUserService, loginUserService } from "../services/authService.js";
import logger from "../utils/logger.js";
// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await registerUserService(name, email, password, role);
    logger.info(`✅ User registered successfully: ${user.id}`);
    res.status(201).json({ message: "User registered", userId: user.id });
  } catch (err) {
    logger.error(`❌ Error registering user: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token } = await loginUserService(email, password);
    logger.info(`✅ User logged in successfully: ${email}`);
    res.json({ token });
  } catch (err) {
    logger.error(`❌ Error logging in user: ${err.message}`);
    res.status(400).json({ error: err.message });
  }
};
