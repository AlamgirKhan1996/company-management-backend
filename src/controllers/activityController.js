import * as activityService from "../services/activityService.js";

export const getActivityLogs = async (req, res, next) => {
  try {
    const logs = await activityService.getActivityLogs();
    logger.info(`Get Activity Logs: ${logs.length} logs retrieved`);
    res.status(200).json(logs);
  } catch (err) {
    logger.error(`Error getting activity logs: ${err.message}`);
    res.status(500).json({ error: err.message });
    next(err);
  }
};
