import * as activityService from "../services/activityService.js";
import logger from "../utils/logger.js";
import redis from "../config/redisClient.js";

const ACTIVITY_LOG_CACHE_KEY = "ActivityLogs";

// ✅ Get Activity Logs

export const getActivityLogs = async (req, res, next) => {
  try {
    const logs = await activityService.getActivityLogs();
    logger.info(`Get Activity Logs: ${logs.length} logs retrieved`);
    await redis.set(ACTIVITY_LOG_CACHE_KEY, JSON.stringify(logs));
    res.status(200).json(logs);
  } catch (err) {
    logger.error(`Error getting activity logs: ${err.message}`);
    await redis.del(ACTIVITY_LOG_CACHE_KEY);
    res.status(500).json({ error: err.message });
    next(err);
  }
};
