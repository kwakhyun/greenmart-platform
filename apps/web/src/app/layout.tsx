import type { Metadata } from "next";
import QueryProvider from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/ui";
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
    <html lang="ko">
      <body>
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
