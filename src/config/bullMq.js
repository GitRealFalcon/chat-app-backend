import { createClient } from "redis";
import {
  BULL_REDIS_CONFIG_DB,
  BULL_REDIS_CONFIG_HOST,
  BULL_REDIS_CONFIG_PASSWORD,
  BULL_REDIS_CONFIG_PORT,
  BULL_REDIS_CONFIG_USERNAME,
} from "./env.js";

export const bullMqConnection = createClient({
  socket: {
    host: BULL_REDIS_CONFIG_HOST,
    port: BULL_REDIS_CONFIG_PORT,
  },
  username: BULL_REDIS_CONFIG_USERNAME,
  password: BULL_REDIS_CONFIG_PASSWORD,
  db: BULL_REDIS_CONFIG_DB,
});
