import * as activityService from "../services/activityService.js";

export const getActivityLogs = async (req, res, next) => {
  try {
    const logs = await activityService.getActivityLogs();
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
    next(err);
  }
};
