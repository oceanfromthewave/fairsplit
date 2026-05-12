import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { CopyInviteButton } from "@/components/copy-invite-button";
import { DeleteExpenseButton } from "@/components/delete-expense-button";
import { DeleteMemberPaymentButton } from "@/components/delete-member-payment-button";
import { ExpenseForm } from "@/components/expense-form";
import { GroupDangerZone } from "@/components/group-danger-zone";
import { RecordTransferPaidButton } from "@/components/record-transfer-paid-button";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { displayName } from "@/lib/display-name";
import { formatWon } from "@/lib/money";
import { getRequestOrigin } from "@/lib/origin";
import { computeNetBalances, simplifyDebts, applyMemberPayments } from "@/lib/settlement";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ groupId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupId } = await params;
  const g = await db.group.findUnique({
    where: { id: groupId },
    select: { name: true },
  });
  return { title: g?.name ?? "그룹" };
}

export default async function GroupPage({ params }: Props) {
  const { groupId } = await params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const group = await db.group.findFirst({
    where: { id: groupId, members: { some: { userId: session.user.id } } },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      expenses: {
        orderBy: { spentAt: "desc" },
        include: {
          paidBy: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
          shares: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      },
      memberPayments: {
        orderBy: { createdAt: "desc" },
        include: {
          fromUser: { select: { id: true, name: true, email: true } },
          toUser: { select: { id: true, name: true, email: true } },
          recordedBy: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!group) notFound();

  const origin = await getRequestOrigin();
  const inviteUrl = origin ? `${origin}/join/${group.inviteToken}` : `/join/${group.inviteToken}`;

  const settlementInput = group.expenses.map((e) => ({
    amountCents: e.amountCents,
    paidById: e.paidById,
    participantIds: e.shares.map((s) => s.userId),
  }));
  const expenseNet = computeNetBalances(settlementInput);
  const paymentAdjustments = group.memberPayments.map((p) => ({
    fromUserId: p.fromUserId,
    toUserId: p.toUserId,
    amountWon: p.amountWon,
  }));
  const net = applyMemberPayments(expenseNet, paymentAdjustments);
  const transfers = simplifyDebts(net);

  const memberById = new Map(group.members.map((m) => [m.userId, m.user]));
  const isOwner = group.ownerId === session.user.id;

  return (
    <div className="flex flex-1 flex-col gap-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/app"
            className="text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            ← 전체 그룹
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{group.name}</h1>
        </div>
        <CopyInviteButton inviteUrl={inviteUrl} />
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            지출 추가
          </h2>
          <Card className="mt-3">
            <ExpenseForm
              groupId={group.id}
              members={group.members.map((m) => ({ userId: m.userId, user: m.user }))}
              currentUserId={session.user.id}
            />
          </Card>
        </section>

        <section className="lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            잔액
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
            지출과 아래에서 기록한 <strong className="font-medium text-[var(--foreground)]">지불 완료</strong>를
            함께 반영합니다. 제안 이체에서{" "}
            <strong className="font-medium text-[var(--foreground)]">받는 사람</strong>만 지불 완료를
            기록할 수 있습니다.
          </p>
          <Card className="mt-3 space-y-4">
            {group.expenses.length === 0 && group.memberPayments.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                지출을 추가하면 멤버별 잔액과 제안 이체가 표시됩니다.
              </p>
            ) : (
              <>
                <ul className="space-y-2">
                  {group.members.map((m) => {
                    const v = net.get(m.userId) ?? 0;
                    const label =
                      v === 0
                        ? "정산 완료"
                        : v > 0
                          ? `받을 금액 ${formatWon(v)}`
                          : `낼 금액 ${formatWon(-v)}`;
                    return (
                      <li
                        key={m.userId}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="font-medium">{displayName(m.user)}</span>
                        <span className="font-mono tabular-nums text-[var(--muted)]">{label}</span>
                      </li>
                    );
                  })}
                </ul>
                {transfers.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      제안 이체
                    </p>
                    <ul className="mt-2 space-y-3">
                      {transfers.map((t, i) => {
                        const fromU = memberById.get(t.fromId);
                        const toU = memberById.get(t.toId);
                        if (!fromU || !toU) return null;
                        const confirmLabel = `${displayName(fromU)}님이 ${displayName(toU)}님에게 ${formatWon(t.cents)}`;
                        return (
                          <li
                            key={`${t.fromId}-${t.toId}-${i}`}
                            className="flex flex-col gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)]/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <p className="text-sm text-[var(--foreground)]">
                              <span className="font-medium">{displayName(fromU)}</span>님이{" "}
                              <span className="font-medium">{displayName(toU)}</span>님에게{" "}
                              <span className="font-mono tabular-nums">{formatWon(t.cents)}</span>
                            </p>
                            <RecordTransferPaidButton
                              groupId={group.id}
                              fromUserId={t.fromId}
                              toUserId={t.toId}
                              amountWon={t.cents}
                              confirmLabel={confirmLabel}
                              currentUserId={session.user.id}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
                {group.memberPayments.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      기록된 지불
                    </p>
                    <ul className="mt-2 space-y-2">
                      {group.memberPayments.map((p) => (
                        <li
                          key={p.id}
                          className="flex flex-col gap-2 border-b border-[var(--border)] pb-2 text-sm last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <span className="font-medium">{displayName(p.fromUser)}</span>
                            {" → "}
                            <span className="font-medium">{displayName(p.toUser)}</span>
                            <span className="ms-2 font-mono tabular-nums">{formatWon(p.amountWon)}</span>
                            <span className="mt-1 block text-xs text-[var(--muted)]">
                              {p.createdAt.toLocaleString("ko-KR", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}{" "}
                              · 기록 {displayName(p.recordedBy)}
                            </span>
                          </div>
                          <DeleteMemberPaymentButton paymentId={p.id} groupId={group.id} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </Card>
        </section>
      </div>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">장부</h2>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[var(--muted)]">
          <strong className="font-medium text-[var(--foreground)]">작성</strong>은 이 항목을 장부에
          올린 사람이고, <strong className="font-medium text-[var(--foreground)]">실제 결제</strong>는
          돈을 선납한 사람입니다. 멤버 간 송금은 오른쪽{" "}
          <strong className="font-medium text-[var(--foreground)]">제안 이체</strong>의{" "}
          <strong className="font-medium text-[var(--foreground)]">지불 완료</strong>는 받는 사람만
          남길 수 있습니다.
        </p>
        {group.expenses.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/60 px-6 py-12 text-center text-sm text-[var(--muted)]">
            아직 지출이 없습니다. 위에서 첫 지출을 추가해 보세요.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">날짜</th>
                  <th className="px-4 py-3 font-medium">내용</th>
                  <th className="px-4 py-3 font-medium">작성</th>
                  <th className="px-4 py-3 font-medium">실제 결제</th>
                  <th className="px-4 py-3 text-right font-medium">금액</th>
                  <th className="px-4 py-3 text-right font-medium" aria-label="작업" />
                </tr>
              </thead>
              <tbody>
                {group.expenses.map((e) => (
                  <tr key={e.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="px-4 py-3 text-[var(--muted)]">
                      {e.spentAt.toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{e.title}</div>
                      {e.shares.length > 0 ? (
                        <p className="mt-1 text-xs leading-snug text-[var(--muted)]">
                          나눔{" "}
                          {e.shares.map((s) => displayName(s.user)).join(", ")}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)]">{displayName(e.createdBy)}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">
                      <span className="text-[var(--foreground)]">{displayName(e.paidBy)}</span>
                      {e.paidById !== e.createdById ? (
                        <span className="mt-0.5 block text-xs font-normal normal-case text-[var(--muted)]">
                          작성자와 다름
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {formatWon(e.amountCents)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteExpenseButton expenseId={e.id} groupId={group.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <GroupDangerZone groupId={group.id} isOwner={isOwner} />
    </div>
  );
}
