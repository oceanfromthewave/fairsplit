import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/** 둘 다 채워진 경우에만 Zod 검증. Vercel에 아직 변수가 없을 때도 빌드는 통과합니다. */
function envVarsReadyForValidation(): boolean {
  const db = process.env.DATABASE_URL?.trim();
  const secret = process.env.AUTH_SECRET?.trim();
  return Boolean(db && secret);
}

export const env = createEnv({
  emptyStringAsUndefined: true,
  server: {
    DATABASE_URL: z.preprocess(
      (val) => (typeof val === "string" ? val.trim() : val),
      z
        .string()
        .min(1, "DATABASE_URL이 비어 있습니다.")
        .refine(
          (v) =>
            v.startsWith("postgresql://") ||
            v.startsWith("postgres://") ||
            v.startsWith("prisma+postgres://"),
          "DATABASE_URL은 postgres 연결 문자열이어야 합니다 (postgresql:// …).",
        ),
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
  skipValidation:
    Boolean(process.env.SKIP_ENV_VALIDATION) || !envVarsReadyForValidation(),
  onValidationError: (issues) => {
    const detail = issues
      .map((i) => `  - ${i.path?.length ? i.path.join(".") : "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment variables.\n${detail}\n\n` +
        "Vercel → Project → Settings → Environment Variables 에서 확인하세요.\n" +
        "필수: DATABASE_URL (postgresql:// 또는 postgres:// …), AUTH_SECRET (공백 제거 후 16자 이상).\n" +
        "선택: AUTH_URL (비우려면 변수 자체를 삭제; 빈 값은 이제 허용됩니다), GitHub OAuth 시 ID/SECRET 쌍.\n" +
        "빌드에도 같은 환경이 필요합니다(Production / Preview 각각 등록).\n" +
        "변수가 없으면 빌드는 통과하지만, 사이트 동작을 위해 두 값은 꼭 넣어야 합니다.",
    );
  },
});
