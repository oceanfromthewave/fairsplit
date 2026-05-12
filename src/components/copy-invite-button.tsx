"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyInviteButton({ inviteUrl }: { inviteUrl: string }) {
  const [done, setDone] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      className="h-9 shrink-0 self-start text-sm sm:self-auto"
      title="초대 링크를 클립보드에 복사합니다"
      aria-label="초대 링크 복사"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(inviteUrl);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          setDone(false);
        }
      }}
    >
      {done ? "복사됨" : "초대 링크"}
    </Button>
  );
}
