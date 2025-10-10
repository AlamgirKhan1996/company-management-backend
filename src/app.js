import express from "express";
import dotenv from "dotenv";
import { swaggerSpec } from "./config/swagger.js";
import swaggerUi from "swagger-ui-express";
import userRoutes from "./routes/userRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import activityRoutes from "./routes/activityRoutes.js";
import fileRoutes from "./routes/fileRoutes.js"; // Import file routes

dotenv.config();
const app = express();


app.use(express.json());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root
app.get("/", (req, res) => {
  res.send("Company Management Backend is running!");
});

// Auth
app.use("/api/auth", authRoutes);

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activity-logs", activityRoutes);
app.use("/api/files", fileRoutes); // Serve static files from uploads directory
app.use(errorHandler);

export default app;