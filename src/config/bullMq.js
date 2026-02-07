import { createClient } from "redis";
import {
  BULL_REDIS_CONFIG_DB,
  BULL_REDIS_CONFIG_HOST,
  BULL_REDIS_CONFIG_PASSWORD,
  BULL_REDIS_CONFIG_PORT,
} from "./env.js";

export const bullMqConnection = {
  host: BULL_REDIS_CONFIG_HOST,
  port: Number(BULL_REDIS_CONFIG_PORT),
  password: BULL_REDIS_CONFIG_PASSWORD,
  db: Number(BULL_REDIS_CONFIG_DB),
  socket: {
    connectTimeout: 20000,
  },
}


