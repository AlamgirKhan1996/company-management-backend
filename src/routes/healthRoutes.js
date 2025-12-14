import express from "express";
import prisma from "../utils/prismaClient.js";
import redis from "../config/redis.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const health = { status: "ok", db: false, redis: false };

  try {
    await prisma.$queryRaw`SELECT 1`;
    health.db = true;
  } catch {
    health.db = false;
  }

  try {
    const pong = await redis.ping();
    health.redis = pong === "PONG";
  } catch {
    health.redis = false;
  }

  res.status(200).json(health);
});

export default router;
