import { createClient } from "redis";
import {
  REDIS_CONFIG_HOST,
  REDIS_CONFIG_DB,
  REDIS_CONFIG_PASSWORD,
  REDIS_CONFIG_PORT,
  REDIS_CONFIG_USERNAME,
} from "./env";

export const redisClient = createClient({
  socket: {
    host: REDIS_CONFIG_HOST,
    port: REDIS_CONFIG_PORT,
  },
  username: REDIS_CONFIG_USERNAME,
  password: REDIS_CONFIG_PASSWORD,
  database: REDIS_CONFIG_DB,
});

export const redisPub = redisClient.duplicate();
export const redisSub = redisClient.duplicate();

export const connectRedis = async () => {
  await Promise.all([
    redisClient.connect(),
    redisPub.connect(),
    redisSub.connect(),
  ]);

  [redisClient, redisPub, redisSub].forEach((client) => {
    client.on("error", (err) => {
      console.error("❌ Redis Error:", err);
    });
  });

  console.log("✅ Redis connected");
};
