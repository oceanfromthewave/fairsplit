import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = {
  title: "회원가입",
  description: "페어스플릿 계정을 만들고 공동 지출을 함께 관리하세요.",
};

function RegisterFallback() {
  return (
    <div
      className="mx-auto mt-16 h-[28rem] max-w-md animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--card)]"
      aria-hidden
    />
  );
}

export default async function RegisterPage() {
  const session = await auth();
  if (session) redirect("/app");

  return (
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:px-6">
      <Suspense fallback={<RegisterFallback />}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
