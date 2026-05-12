import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { signOutAction } from "@/server/sign-out-action";

const linkBase =
  "inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href={session ? "/app" : "/"}
          className="flex items-center gap-2 font-semibold tracking-tight text-[var(--foreground)]"
        >
          <img
            src="/brand-icon.svg"
            alt=""
            width={28}
            height={28}
            className="size-7 shrink-0 rounded-md"
          />
          <span>페어스플릿</span>
        </Link>
        <nav className="flex items-center gap-2" aria-label="주 메뉴">
          {session ? (
            <>
              <Link
                href="/app"
                className={cn(linkBase, "text-[var(--foreground)] hover:bg-[var(--muted-bg)]")}
              >
                내 그룹
              </Link>
              <form action={signOutAction}>
                <Button variant="secondary" className="h-9 px-3 text-sm" type="submit">
                  로그아웃
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(linkBase, "text-[var(--foreground)] hover:bg-[var(--muted-bg)]")}
              >
                로그인
              </Link>
              <Link
                href="/register"
                className={cn(
                  linkBase,
                  "bg-[var(--accent)] text-[var(--accent-foreground)] shadow-sm hover:opacity-95",
                )}
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
