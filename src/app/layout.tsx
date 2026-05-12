import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";

function metadataBaseUrl() {
  if (process.env.AUTH_URL) return new URL(process.env.AUTH_URL);
  if (process.env.VERCEL_URL) return new URL(`https://${process.env.VERCEL_URL}`);
  return new URL("http://localhost:3000");
}

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: metadataBaseUrl(),
  title: {
    default: "페어스플릿 — 함께 쓴 돈, 공정하게 정산",
    template: "%s · 페어스플릿",
  },
  description:
    "룸메이트·여행·소규모 팀을 위한 공동 지출 장부입니다. 누가 냈는지, 누가 얼마를 갚아야 하는지, 최소 이체로 어떻게 맞출지 한눈에 보여 드립니다.",
  icons: {
    icon: [{ url: "/brand-icon.svg", type: "image/svg+xml" }],
    apple: "/brand-icon.svg",
  },
  openGraph: {
    title: "페어스플릿",
    description: "공동 지출과 잔액, 제안 이체까지 한곳에서 관리하세요.",
    type: "website",
    locale: "ko_KR",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="ko"
      className={`${manrope.variable} ${plexMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <Providers session={session}>
          <SiteHeader />
          <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
