// src/config/redisClient.js
import Redis from "ioredis";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

const redisUrl = process.env.REDIS_URL;
let redis;

if (redisUrl) {
  // Production (Railway / Upstash)
  // ioredis handles the connection string automatically
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    // Only use TLS if the URL starts with rediss:// (with two 's's)
    tls: redisUrl.startsWith("rediss://") ? { rejectUnauthorized: false } : undefined,
  });
  logger.info("🟢 Redis (Cloud) connected");
} else {
  // Local Development
  redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1", // Changed from 'redis' to '127.0.0.1' for safety
    port: process.env.REDIS_PORT || 6379,
  });
  logger.info("🟢 Redis (Local) connected");
}

redis.on("error", (err) => {
  logger.error("❌ Redis error:", err.message);
});

export default redis;