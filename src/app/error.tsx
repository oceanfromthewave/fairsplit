"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const btn =
    "inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium transition";

  return (
    <html lang="ko">
      <body className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] px-4 text-[#141312]">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">문제가 발생했습니다</h1>
          <p className="mt-2 text-sm text-[#5c5854]">
            예기치 않은 오류입니다. 다시 시도하거나 홈으로 이동해 주세요.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className={`${btn} bg-[#0f4d42] text-[#f4faf8] hover:opacity-95`}
              onClick={() => reset()}
            >
              다시 시도
            </button>
            <Link
              href="/"
              className={`${btn} border border-[#e4ddd4] bg-white hover:bg-[#f0ebe4]`}
            >
              홈으로
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
