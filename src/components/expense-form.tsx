"use client";

import { useActionState, useMemo, useState } from "react";
import { expenseCreateAction } from "@/server/expense-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { displayName } from "@/lib/display-name";

type Member = {
  userId: string;
  user: { name: string | null; email: string };
};

export function ExpenseForm({
  groupId,
  members,
  currentUserId,
}: {
  groupId: string;
  members: Member[];
  currentUserId: string;
}) {
  const ids = useMemo(() => members.map((m) => m.userId), [members]);
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ids.map((id) => [id, true])),
  );
  const [paidBy, setPaidBy] = useState(currentUserId);

  const [state, formAction, pending] = useActionState(expenseCreateAction, undefined);

  function onPaidByChange(value: string) {
    setPaidBy(value);
    setSelected((s) => ({ ...s, [value]: true }));
  }

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  const selectedIds = ids.filter((id) => selected[id]);
  const atLeastOne = selectedIds.length > 0;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="groupId" value={groupId} />

      {state && !state.ok && (
        <p className="text-sm text-red-700 dark:text-red-300" role="alert">
          {state.message}
        </p>
      )}
      {state?.ok && (
        <p className="text-sm text-[var(--accent)]" role="status">
          {state.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="title">내용</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="장보기, 기차표, 저녁 식사…"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="amount">금액 (원)</Label>
          <Input
            id="amount"
            name="amount"
            inputMode="numeric"
            required
            placeholder="48000"
            className="mt-1.5 font-mono tabular-nums"
          />
        </div>
        <div>
          <Label htmlFor="spentAt">날짜</Label>
          <Input
            id="spentAt"
            name="spentAt"
            type="date"
            className="mt-1.5"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </div>

      <div>
        <Label id="paidby-label">실제 결제한 사람</Label>
        <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
          장부에는 지금 로그인한 계정이 <strong className="font-medium text-[var(--foreground)]">작성자</strong>로
          저장됩니다. 카드·현금으로 낸 사람이 다르면 여기서 선택하세요.
        </p>
        <select
          name="paidById"
          aria-labelledby="paidby-label"
          className="mt-1.5 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 text-sm focus-visible:border-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          value={paidBy}
          onChange={(e) => onPaidByChange(e.target.value)}
        >
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {displayName(m.user)}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="text-sm font-medium">나눌 사람</legend>
        <ul className="mt-2 space-y-2">
          {members.map((m) => (
            <li key={m.userId} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`p-${m.userId}`}
                name="participantIds"
                value={m.userId}
                checked={Boolean(selected[m.userId])}
                onChange={() => toggle(m.userId)}
                className="size-4 rounded border-[var(--border)]"
              />
              <label htmlFor={`p-${m.userId}`} className="text-sm">
                {displayName(m.user)}
              </label>
            </li>
          ))}
        </ul>
        {!atLeastOne && (
          <p className="mt-2 text-xs text-red-700 dark:text-red-300">
            최소 한 명을 선택해야 금액을 나눌 수 있습니다.
          </p>
        )}
      </fieldset>

      <Button type="submit" disabled={pending || !atLeastOne}>
        {pending ? "저장 중…" : "지출 추가"}
      </Button>
    </form>
  );
}
