import { REDIS_CONFIG } from "../config/redis.config";
import { createClient } from "redis";

export const redisPublisher = createClient({
  socket: {
    host: REDIS_CONFIG.host,
    port: REDIS_CONFIG.port
  },
  username: REDIS_CONFIG.username,
  password: REDIS_CONFIG.password,
  database: REDIS_CONFIG.db
});


export const redisSubscriber = createClient({
  socket: {
    host: REDIS_CONFIG.host,
    port: REDIS_CONFIG.port
  },
  username: REDIS_CONFIG.username,
  password: REDIS_CONFIG.password,
  database: REDIS_CONFIG.db
});

await redisSubscriber.connect();

await redisPublisher.connect();