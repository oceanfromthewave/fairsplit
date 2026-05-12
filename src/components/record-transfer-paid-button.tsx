"use client";

import { useActionState } from "react";
import { recordMemberPaymentFromForm } from "@/server/member-payment-actions";
import { Button } from "@/components/ui/button";

export function RecordTransferPaidButton({
  groupId,
  fromUserId,
  toUserId,
  amountWon,
  confirmLabel,
  currentUserId,
}: {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amountWon: number;
  confirmLabel: string;
  /** 받는 사람(toUserId)만 기록 가능 */
  currentUserId: string;
}) {
  const [state, action, pending] = useActionState(recordMemberPaymentFromForm, undefined);

  if (currentUserId !== toUserId) {
    return (
      <p className="max-w-[14rem] text-right text-xs leading-snug text-[var(--muted)]">
        받는 당사자만 지불 완료를 누를 수 있습니다.
      </p>
    );
  }

  return (
    <form
      action={action}
      className="inline"
      onSubmit={(e) => {
        if (!confirm(`${confirmLabel}\n\n받은 금액으로 장부에 기록할까요?`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="fromUserId" value={fromUserId} />
      <input type="hidden" name="toUserId" value={toUserId} />
      <input type="hidden" name="amount" value={String(amountWon)} />
      <Button type="submit" variant="secondary" className="h-8 shrink-0 px-2.5 text-xs" disabled={pending}>
        {pending ? "…" : "지불 완료"}
      </Button>
      {state && !state.ok && (
        <span className="sr-only" role="alert">
          {state.message}
        </span>
      )}
    </form>
  );
}
