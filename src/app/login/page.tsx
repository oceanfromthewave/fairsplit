import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { LoginForm } from "@/components/login-form";
import { env } from "@/env";

export const metadata: Metadata = {
  title: "로그인",
  description: "페어스플릿에 로그인하여 그룹과 지출을 관리하세요.",
};

function LoginFallback() {
  return (
    <div
      className="mx-auto mt-16 h-96 max-w-md animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]"
      aria-hidden
    />
  );
}

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/app");

  const githubEnabled = Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:px-6">
      <Suspense fallback={<LoginFallback />}>
        <LoginForm githubEnabled={githubEnabled} />
      </Suspense>
    </main>
  );
}
