"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ githubEnabled }: { githubEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const callbackRaw = searchParams.get("callbackUrl");
  const callbackUrl =
    callbackRaw && callbackRaw.startsWith("/") && !callbackRaw.startsWith("//")
      ? callbackRaw
      : "/app";

  const qp = searchParams.get("error");
  const urlError =
    qp === "github_email"
      ? "GitHub에서 이메일을 제공하지 않았습니다. GitHub 프로필에 공개 이메일을 추가하거나 비밀번호로 로그인해 주세요."
      : qp
        ? "로그인이 중단되었습니다. 다시 시도해 주세요."
        : null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setPending(false);
    if (res?.error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <h1 className="text-xl font-semibold tracking-tight">로그인</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        이메일과 비밀번호로 로그인하거나, GitHub로 계속할 수 있습니다.
      </p>

      {(error || urlError) && (
        <p
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100"
          role="alert"
        >
          {error ?? urlError}
        </p>
      )}

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1.5"
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "로그인 중…" : "로그인"}
        </Button>
      </form>

      {githubEnabled && (
        <div className="mt-6">
          <div className="relative text-center text-xs text-[var(--muted)]">
            <span className="relative z-10 bg-[var(--card)] px-2">또는</span>
            <span className="absolute inset-x-0 top-1/2 z-0 h-px bg-[var(--border)]" aria-hidden />
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-4 w-full"
            disabled={pending}
            onClick={() => {
              setPending(true);
              void signIn("github", { callbackUrl: callbackUrl });
            }}
          >
            GitHub로 계속하기
          </Button>
        </div>
      )}
    </Card>
  );
}
