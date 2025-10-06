import * as activityService from "../services/activityService.js";

export const getActivityLogs = async (req, res, next) => {
  try {
    const logs = await activityService.getActivityLogs();
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};
