"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createGroup } from "@/server/group-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewGroupForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createGroup, undefined);

  useEffect(() => {
    if (state?.ok && state.groupId) {
      router.push(`/app/groups/${state.groupId}`);
    }
  }, [state, router]);

  return (
    <Card className="mx-auto w-full max-w-lg">
      <h1 className="text-xl font-semibold tracking-tight">새 그룹</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        집·여행 등 짧은 이름을 정해 주세요. 만든 뒤 초대 링크로 멤버를 초대할 수 있습니다.
      </p>

      {state && !state.ok && (
        <p className="mt-4 text-sm text-red-700 dark:text-red-300" role="alert">
          {state.message}
        </p>
      )}

      <form className="mt-6 space-y-4" action={formAction}>
        <div>
          <Label htmlFor="name">그룹 이름</Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="리스본 주말 여행"
            className="mt-1.5"
            autoFocus
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "만드는 중…" : "그룹 만들기"}
        </Button>
      </form>
    </Card>
  );
}
