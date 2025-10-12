import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
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
import logger from "./utils/logger.js";

dotenv.config();
const app = express();
// Security Middleware
app.use(helmet()); // Sets secure HTTP headers

// Optional Professional Touch
// For production, you can restrict CORS to your frontend domain:
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://mycompany.com"
}));
app.use(express.json());

app.use(morgan("combined", {
  stream:{
    write: (message) => logger.info(message.trim(),)
  }
}))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);


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