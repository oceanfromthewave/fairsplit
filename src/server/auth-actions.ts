"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

const registerSchema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().email({ message: "올바른 이메일을 입력해 주세요." }).transform((e) => e.toLowerCase().trim()),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다.").max(128),
});

export type AuthFormState =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string[] | undefined> };

export async function registerAction(
  _prev: AuthFormState | undefined,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name") || undefined,
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      ok: false,
      message: "입력값을 다시 확인해 주세요.",
      fieldErrors,
    };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, message: "이미 사용 중인 이메일입니다." };
  }

  const passwordHash = await hash(password, 12);

  try {
    await db.user.create({
      data: {
        email,
        name: name || null,
        password: passwordHash,
      },
    });
  } catch (e) {
    logger.error({ err: e }, "register_failed");
    return { ok: false, message: "계정을 만들 수 없습니다. 잠시 후 다시 시도해 주세요." };
  }

  return { ok: true };
}
