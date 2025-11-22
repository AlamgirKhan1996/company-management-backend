import * as activityService from "../services/activityService.js";
import logger from "../utils/logger.js";
import { Cache } from "../utils/cache.js";
import {CacheKeys} from "../utils/cacheKeys.js";

const ACTIVITY_LOG_CACHE_KEY = CacheKeys.activity.logs;

// ✅ Get Activity Logs

export const getActivityLogs = async (req, res, next) => {
  try {
    const logs = await activityService.getActivityLogs();
    logger.info(`Get Activity Logs: ${logs.length} logs retrieved`);
   await Cache.del(ACTIVITY_LOG_CACHE_KEY);
    res.status(200).json(logs);
  } catch (err) {
    logger.error(`Error getting activity logs: ${err.message}`);
    await Cache.del(ACTIVITY_LOG_CACHE_KEY);
    res.status(500).json({ error: err.message });
    next(err);
  }
};
