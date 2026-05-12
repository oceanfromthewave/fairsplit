import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const groups = await db.group.findMany({
    where: { members: { some: { userId } } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      updatedAt: true,
      _count: { select: { expenses: true, members: true } },
    },
  });

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">내 그룹</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            그룹마다 장부·초대 링크·잔액이 따로 관리됩니다.
          </p>
        </div>
        <Link
          href="/app/groups/new"
          className="inline-flex h-10 shrink-0 items-center justify-center self-start rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-[var(--accent-foreground)] shadow-sm hover:opacity-95 sm:self-auto"
        >
          새 그룹
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/60 px-6 py-20 text-center">
          <p className="max-w-sm text-sm text-[var(--muted)]">
            아직 그룹이 없습니다. 여행이나 집 지출용 그룹을 만든 뒤, 초대 링크를 공유하면 모두가
            지출을 추가할 수 있어요.
          </p>
          <Link
            href="/app/groups/new"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent)] px-5 text-sm font-medium text-[var(--accent-foreground)] shadow-sm hover:opacity-95"
          >
            첫 그룹 만들기
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {groups.map((g) => (
            <li key={g.id}>
              <Link
                href={`/app/groups/${g.id}`}
                className="block rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition hover:border-[var(--accent)]/40"
              >
                <h2 className="font-semibold tracking-tight">{g.name}</h2>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  멤버 {g._count.members}명 · 지출 {g._count.expenses}건 · 마지막 수정{" "}
                  {g.updatedAt.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
