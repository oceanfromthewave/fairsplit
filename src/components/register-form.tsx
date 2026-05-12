"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { registerAction } from "@/server/auth-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackRaw = searchParams.get("callbackUrl");
  const callbackUrl =
    callbackRaw && callbackRaw.startsWith("/") && !callbackRaw.startsWith("//")
      ? callbackRaw
      : "/app";

  const [state, formAction, pending] = useActionState(registerAction, undefined);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!state?.ok) return;
    void (async () => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        router.push("/login?error=register");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    })();
  }, [state, email, password, router, callbackUrl]);

  return (
    <Card className="mx-auto w-full max-w-md">
      <h1 className="text-xl font-semibold tracking-tight">회원가입</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        1분 안에 그룹을 만들 수 있습니다. 카드 등록은 필요 없습니다.
      </p>

      {state && !state.ok && (
        <p
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100"
          role="alert"
        >
          {state.message}
        </p>
      )}

      <form className="mt-6 space-y-4" action={formAction}>
        <div>
          <Label htmlFor="name">표시 이름 (선택)</Label>
          <Input id="name" name="name" autoComplete="name" className="mt-1.5" />
          {state && !state.ok && state.fieldErrors?.name && (
            <p className="mt-1 text-xs text-red-700 dark:text-red-300">
              {state.fieldErrors.name.join(", ")}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1.5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {state && !state.ok && state.fieldErrors?.email && (
            <p className="mt-1 text-xs text-red-700 dark:text-red-300">
              {state.fieldErrors.email.join(", ")}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="mt-1.5"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {state && !state.ok && state.fieldErrors?.password && (
            <p className="mt-1 text-xs text-red-700 dark:text-red-300">
              {state.fieldErrors.password.join(", ")}
            </p>
          )}
          <p className="mt-1 text-xs text-[var(--muted)]">8자 이상 입력해 주세요.</p>
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "가입 처리 중…" : "회원가입"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        이미 계정이 있으신가요?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
        >
          로그인
        </Link>
      </p>
    </Card>
  );
}
