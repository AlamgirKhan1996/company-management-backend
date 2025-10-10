// src/config/env.js
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.preprocess((val) => (val ? Number(val) : undefined), z.number().positive().default(5000)),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters"),
  // Optional / helpful extras:
  CLIENT_URL: z.string().url().optional(), // frontend origin for CORS
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Print helpful message and exit — this prevents mysterious runtime errors later
  console.error("❌ Invalid environment variables:", parsed.error.format());
  // Optionally, log the simple error message:
  console.error(parsed.error.errors.map(e => `${e.path.join(".")}: ${e.message}`).join("\n"));
  process.exit(1);
}

const env = parsed.data;
export default env;
