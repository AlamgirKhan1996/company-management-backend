// src/config/redisClient.js
import Redis from "ioredis";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

let redis;

try {
  // If REDIS_URL exists → Use Upstash (production)
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      tls: {
        rejectUnauthorized: false,
      },
    });

    logger.info("🟢 Redis (Upstash) connected");
  } else {
    // Otherwise local Redis (Docker)
    redis = new Redis({
      host: process.env.REDIS_HOST || "redis",
      port: process.env.REDIS_PORT || 6379,
    });

    logger.info("🟢 Redis (Local Docker) connected");
  }

  redis.on("error", (err) => {
    logger.error("❌ Redis error:", err);
  });
} catch (err) {
  logger.error("❌ Failed to initialize Redis:", err);
}

export default redis;
