import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-sm font-medium text-[var(--muted)]">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">페이지를 찾을 수 없습니다</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        주소가 잘못되었거나 삭제된 페이지일 수 있습니다.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center justify-center rounded-lg bg-[var(--accent)] px-5 text-sm font-medium text-[var(--accent-foreground)]"
      >
        홈으로
      </Link>
    </main>
  );
}
