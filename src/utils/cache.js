import redis from "../config/redisClient.js";

export const Cache = {
  // GET from cache
  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("❌ Cache GET error:", err);
      return null;
    }
  },

  // SET to cache
  async set(key, value, ttl = 60) {
    try {
      await redis.set(key, JSON.stringify(value), "EX", ttl);
    } catch (err) {
      console.error("❌ Cache SET error:", err);
    }
  },

  // DELETE one key
  async del(key) {
    try {
      await redis.del(key);
    } catch (err) {
      console.error("❌ Cache DELETE error:", err);
    }
  },

  // DELETE multiple keys (pattern support)
  async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) await redis.del(keys);
    } catch (err) {
      console.error("❌ Cache PATTERN DELETE error:", err);
    }
  }
};
