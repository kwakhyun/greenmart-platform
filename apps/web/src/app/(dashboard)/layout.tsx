"use client";

import Sidebar from "@/components/layout/Sidebar";
import CommandPalette from "@/components/layout/CommandPalette";
import { ShortcutHelpModal } from "@/components/layout/ShortcutHelpModal";
import { ScrollProgress, Breadcrumb, PageTransition } from "@/components/ui";
import { useSidebarStore } from "@/stores/sidebar-store";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed);
  const pathname = usePathname();

  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div
        className={`flex-1 transition-all duration-300 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"}`}
      >
        <ScrollProgress />
        <Breadcrumb />
        <main id="main-content" tabIndex={-1}>
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <CommandPalette />
      <ShortcutHelpModal />
    </div>
  );
}
