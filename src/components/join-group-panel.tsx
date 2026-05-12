"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { joinGroupByToken } from "@/server/group-actions";
import { Button } from "@/components/ui/button";

export function JoinGroupPanel({ token }: { token: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
      <h1 className="text-lg font-semibold tracking-tight">그룹 참여</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        공동 지출 그룹에 초대되었습니다. 아래에서 수락하면 내 그룹 목록에 추가됩니다.
      </p>
      {message && (
        <p className="mt-4 text-sm text-red-700 dark:text-red-300" role="alert">
          {message}
        </p>
      )}
      <Button
        type="button"
        className="mt-6 w-full"
        disabled={pending}
        onClick={() => {
          setMessage(null);
          start(async () => {
            const res = await joinGroupByToken(token);
            if (!res.ok) {
              setMessage(res.message);
              return;
            }
            if (res.groupId) {
              router.push(`/app/groups/${res.groupId}`);
              router.refresh();
            }
          });
        }}
      >
        {pending ? "참여 중…" : "초대 수락하기"}
      </Button>
    </div>
  );
}
