import pino from "pino";
import { env } from "@/env";

const logLevel =
  typeof env.LOG_LEVEL === "string" && env.LOG_LEVEL ? env.LOG_LEVEL : "info";

export const logger = pino({
  level: logLevel,
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
});
