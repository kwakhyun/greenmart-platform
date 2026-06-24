import type { Metadata } from "next";
import QueryProvider from "@/components/providers/QueryProvider";
import { AriaAnnouncerProvider } from "@/components/providers/AriaAnnouncer";
import { ToastProvider, SkipLink } from "@/components/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "GreenMart Fresh",
  description:
    "산지 직송 제철 식재료를 원하는 배송 슬롯에 맞춰 받는 친환경 식료품 주문 서비스",
  icons: {
    icon: "/favicon.svg",
    apple: "/app-icon.svg",
  },
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
