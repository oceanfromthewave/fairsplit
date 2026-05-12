import { Card } from "@/components/ui/card";

export default function AppHomeLoading() {
  return (
    <div className="flex flex-1 flex-col gap-8 animate-pulse">
      <div className="h-10 w-48 rounded-lg bg-[var(--muted-bg)]" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="h-28 border-[var(--border)] bg-[var(--muted-bg)]" />
        <Card className="h-28 border-[var(--border)] bg-[var(--muted-bg)]" />
      </div>
    </div>
  );
}
