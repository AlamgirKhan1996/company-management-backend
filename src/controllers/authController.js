import { registerUserService, loginUserService } from "../services/authService.js";

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await registerUserService(name, email, password, role);
    res.status(201).json({ message: "User registered", userId: user.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token } = await loginUserService(email, password);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
