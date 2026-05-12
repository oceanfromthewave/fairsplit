import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z
      .string()
      .min(1)
      .refine(
        (v) =>
          v.startsWith("postgresql://") ||
          v.startsWith("postgres://") ||
          v.startsWith("prisma+postgres://"),
        "DATABASE_URL은 postgres 연결 문자열이어야 합니다 (postgresql:// …).",
      ),
    AUTH_SECRET: z
      .string()
      .trim()
      .min(
        16,
        "AUTH_SECRET이 너무 짧습니다(앞뒤 공백 제거 후). 로컬은 16자 이상, 운영은 openssl rand -base64 32 권장",
      ),
    AUTH_URL: z.string().url().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),
  },
  client: {},
  experimental__runtimeEnv: {},
  skipValidation: Boolean(process.env.SKIP_ENV_VALIDATION),
});
