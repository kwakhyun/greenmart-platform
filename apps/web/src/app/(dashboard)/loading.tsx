export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-16 bg-white border-b border-gray-200" />

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="flex justify-between">
              <div className="h-3 w-20 bg-gray-200 rounded" />
              <div className="h-8 w-8 bg-gray-200 rounded-lg" />
            </div>
            <div className="h-7 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="h-4 w-28 bg-gray-200 rounded mb-4" />
          <div className="h-[300px] bg-gray-100 rounded-lg" />
        </div>
        <div className="card p-5">
          <div className="h-4 w-28 bg-gray-200 rounded mb-4" />
          <div className="h-[300px] bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
