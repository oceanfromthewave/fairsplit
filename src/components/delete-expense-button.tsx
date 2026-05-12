"use client";

import { useActionState } from "react";
import { deleteExpenseFromForm } from "@/server/expense-actions";
import { Button } from "@/components/ui/button";

export function DeleteExpenseButton({
  expenseId,
  groupId,
}: {
  expenseId: string;
  groupId: string;
}) {
  const [state, action, pending] = useActionState(deleteExpenseFromForm, undefined);

  return (
    <form
      action={action}
      className="inline"
      onSubmit={(e) => {
        if (!confirm("이 지출을 장부에서 삭제할까요?")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="expenseId" value={expenseId} />
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
