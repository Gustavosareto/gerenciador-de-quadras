export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="h-10 w-48 bg-zinc-800/50 rounded-lg mb-2"></div>
          <div className="h-4 w-64 bg-zinc-800/50 rounded-lg"></div>
        </div>
        <div className="h-10 w-40 bg-zinc-800/50 rounded-lg"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-zinc-900/50 border border-white/5 p-6"
          >
            <div className="flex justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-zinc-800"></div>
            </div>
            <div className="h-8 w-24 bg-zinc-800 rounded mb-2"></div>
            <div className="h-4 w-16 bg-zinc-800 rounded"></div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[500px] rounded-xl bg-zinc-900/50 border border-white/5"></div>
        <div className="h-[500px] rounded-xl bg-zinc-900/50 border border-white/5"></div>
      </div>
    </div>
  );
}
