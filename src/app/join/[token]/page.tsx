import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { JoinGroupPanel } from "@/components/join-group-panel";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  return {
    title: "그룹 초대",
    robots: { index: false, follow: false },
    description: `페어스플릿 그룹 초대 (${token.slice(0, 6)}…).`,
  };
}

export default async function JoinPage({ params }: Props) {
  const { token } = await params;
  const session = await auth();
  const next = `/join/${token}`;

  if (!session?.user?.id) {
    return (
      <main className="mx-auto max-w-lg flex-1 px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
          <h1 className="text-lg font-semibold tracking-tight">거의 다 됐어요</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            이 그룹에 참여하려면 로그인하거나 계정을 만든 뒤, 페어스플릿 프로필로 수락해 주세요.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(next)}`}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] shadow-sm hover:opacity-95"
            >
              로그인
            </Link>
            <Link
              href={`/register?callbackUrl=${encodeURIComponent(next)}`}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--muted-bg)] px-4 text-sm font-medium hover:bg-[var(--border)]"
            >
              회원가입
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg flex-1 px-4 py-16 sm:px-6">
      <JoinGroupPanel token={token} />
    </main>
  );
}
