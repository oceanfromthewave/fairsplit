"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteGroupFormAction, leaveGroupFormAction } from "@/server/group-actions";
import { Button } from "@/components/ui/button";

export function GroupDangerZone({
  groupId,
  isOwner,
}: {
  groupId: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [leaveState, leaveAction, leavePending] = useActionState(leaveGroupFormAction, undefined);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteGroupFormAction,
    undefined,
  );

  useEffect(() => {
    if (leaveState?.ok || deleteState?.ok) {
      router.push("/app");
      router.refresh();
    }
  }, [leaveState?.ok, deleteState?.ok, router]);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h2 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">멤버십</h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {isOwner
          ? "그룹을 삭제하면 모든 지출과 멤버 기록이 함께 삭제됩니다."
          : "이 그룹에서 더 이상 비용을 나누지 않을 때 나가실 수 있습니다."}
      </p>

      {leaveState && !leaveState.ok && (
        <p className="mt-3 text-sm text-red-700 dark:text-red-300" role="alert">
          {leaveState.message}
        </p>
      )}
      {deleteState && !deleteState.ok && (
        <p className="mt-3 text-sm text-red-700 dark:text-red-300" role="alert">
          {deleteState.message}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!isOwner && (
          <form
            action={leaveAction}
            onSubmit={(e) => {
              if (!confirm("이 그룹에서 나가시겠어요? 초대 링크로 다시 참여할 수 있습니다.")) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="groupId" value={groupId} />
            <Button type="submit" variant="secondary" disabled={leavePending}>
              {leavePending ? "나가는 중…" : "그룹 나가기"}
            </Button>
          </form>
        )}
        {isOwner && (
          <form
            action={deleteAction}
            onSubmit={(e) => {
              if (
                !confirm(
                  "이 그룹을 영구적으로 삭제할까요? 모든 지출과 잔액 기록이 사라집니다.",
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="groupId" value={groupId} />
            <Button type="submit" variant="danger" disabled={deletePending}>
              {deletePending ? "삭제 중…" : "그룹 삭제"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
