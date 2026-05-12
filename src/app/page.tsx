import Link from "next/link";
import { auth } from "@/auth";
import { cn } from "@/lib/cn";

const btn =
  "inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const signedIn = Boolean(session?.user);

  return (
    <main className="mx-auto flex max-w-5xl flex-1 flex-col px-4 py-16 sm:px-6 lg:py-24">
      <section className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-widest text-[var(--muted)]">
          공동 지출
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          공정하게 나누고, 빨리 마무리하세요.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-[var(--muted)] text-pretty">
          페어스플릿은 룸메이트·여행·사이드 프로젝트의 지출을 한 장부에 모읍니다. 누가 결제했는지,
          누가 얼마를 정리해야 하는지, 최소 이체로 어떻게 맞출지까지 — 광고 없이 필요한 것만
          담았습니다.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          {signedIn ? (
            <Link
              href="/app"
              className={cn(
                btn,
                "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm hover:opacity-95",
              )}
            >
              내 그룹 열기
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className={cn(
                  btn,
                  "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm hover:opacity-95",
                )}
              >
                무료로 시작하기
              </Link>
              <Link
                href="/login"
                className={cn(
                  btn,
                  "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted-bg)]",
                )}
              >
                로그인
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mt-24 grid gap-10 sm:grid-cols-3">
        {[
          {
            title: "하나의 기록",
            body: "결제자·참여자·날짜가 모두 남아 몇 달 뒤에도 왜 이 금액인지 설명할 수 있습니다.",
          },
          {
            title: "검증 가능한 정산",
            body: "균등 분할은 센트 단위까지 맞춥니다. 제안 이체 목록은 항상 같은 규칙으로 계산됩니다.",
          },
          {
            title: "배포를 염두에 둔 구조",
            body: "PostgreSQL, 인증, 구조화 로그, 보안 헤더까지 — 데모가 아니라 서비스 출시를 전제로 했습니다.",
          },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6"
          >
            <h2 className="text-base font-semibold tracking-tight">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
