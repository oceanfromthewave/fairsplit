"use client";

import { useActionState } from "react";
import { deleteMemberPaymentFromForm } from "@/server/member-payment-actions";
import { Button } from "@/components/ui/button";

export function DeleteMemberPaymentButton({
  paymentId,
  groupId,
}: {
  paymentId: string;
  groupId: string;
}) {
  const [state, action, pending] = useActionState(deleteMemberPaymentFromForm, undefined);

  return (
    <form
      action={action}
      className="inline"
      onSubmit={(e) => {
        if (!confirm("이 지불 기록을 삭제할까요? 잔액이 다시 맞춰집니다.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="paymentId" value={paymentId} />
      <input type="hidden" name="groupId" value={groupId} />
      <Button
        type="submit"
        variant="ghost"
        className="h-8 px-2 text-xs text-red-700 dark:text-red-300"
        disabled={pending}
      >
        {pending ? "…" : "삭제"}
      </Button>
      {state && !state.ok && (
        <span className="sr-only" role="alert">
          {state.message}
        </span>
      )}
    </form>
  );
}
