import { DashboardSkeleton } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <>
      {/* Header 스켈레톤 */}
      <header className="sticky top-0 z-30 h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="flex h-full items-center justify-between px-4 lg:px-6">
          <div className="ml-10 lg:ml-0 space-y-1.5">
            <div className="h-5 w-24 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
            <div className="h-3 w-40 rounded bg-gray-100 dark:bg-gray-800/60 animate-pulse hidden sm:block" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-56 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse hidden sm:block" />
            <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
          </div>
        </div>
      </header>
      <DashboardSkeleton />
    </>
  );
}
