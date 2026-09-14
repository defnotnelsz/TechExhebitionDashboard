import { Skeleton } from "@/components/shared/skeleton";

export default function UsersLoading() {
  return (
    <div className="space-y-6 font-manrope">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D8D2C8] dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-72 rounded-md" />
              <Skeleton className="h-4 w-96 max-w-full rounded-md" />
            </div>
          </div>
        </div>
        <Skeleton className="h-9 w-40 rounded-xl" />
      </div>

      {/* Role Summary Bento Grid (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#081C12] p-4 rounded-2xl border border-[#D8D2C8] dark:border-white/10 shadow-xs dark:shadow-floating-dark flex items-center justify-between"
          >
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-7 w-12 rounded" />
            </div>
            <Skeleton className="w-9 h-9 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#081C12] p-3.5 rounded-2xl border border-[#D8D2C8] dark:border-white/10 shadow-xs dark:shadow-floating-dark flex items-center gap-3">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#081C12] rounded-2xl border border-[#D8D2C8] dark:border-white/10 shadow-xs dark:shadow-floating-dark overflow-hidden">
        {/* Table Header */}
        <div className="bg-[#F9F7F7] dark:bg-white/5 px-6 py-3.5 border-b border-[#D8D2C8] dark:border-white/10 flex items-center justify-between">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-[#D8D2C8]/50 dark:divide-white/10">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-48 rounded" />
                </div>
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-28 rounded" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
