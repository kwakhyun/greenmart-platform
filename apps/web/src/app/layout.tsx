import type { Metadata } from "next";
import QueryProvider from "@/components/providers/QueryProvider";
import { AriaAnnouncerProvider } from "@/components/providers/AriaAnnouncer";
import { ToastProvider, SkipLink } from "@/components/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "GreenMart Core Platform",
  description:
    "헬스&뷰티 이커머스 코어 플랫폼 - 카탈로그 · 커스터머 · 인벤토리 · 세틀먼트",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) document.documentElement.classList.add('dark');
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <SkipLink />
        <QueryProvider>
          <AriaAnnouncerProvider>
            <ToastProvider>{children}</ToastProvider>
          </AriaAnnouncerProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
