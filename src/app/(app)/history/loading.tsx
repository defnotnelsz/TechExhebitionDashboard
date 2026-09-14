import { Skeleton } from "@/components/shared/skeleton";

export default function HistoryLoading() {
  return (
    <div className="space-y-6 font-manrope">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D8D2C8] dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-9 h-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-7 w-64 rounded-md" />
              <Skeleton className="h-4 w-96 max-w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-44 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Sub-header Filter Row */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <Skeleton className="h-4 w-32 rounded" />
        <div className="flex items-center gap-1.5 bg-white dark:bg-[#081C12] p-1 rounded-xl border border-[#D8D2C8] dark:border-white/10">
          <Skeleton className="h-7 w-24 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </div>

      {/* 3-Column History Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#081C12] rounded-xl border-[1.5px] border-[#D8D2C8] dark:border-white/10 shadow-sm dark:shadow-floating-dark p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Top Row: Date & Fit Score Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
                <Skeleton className="h-10 w-11 rounded-[8px]" />
              </div>

              {/* Title & Location */}
              <Skeleton className="h-5 w-4/5 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
              <div className="flex items-center gap-1.5 pt-1">
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                <Skeleton className="h-3.5 w-40 rounded" />
              </div>

              {/* Decision Box Skeleton */}
              <div className="bg-[#F9F7F7] dark:bg-white/5 p-3 rounded-lg border border-[#D8D2C8] dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
                <Skeleton className="h-3.5 w-full rounded" />
                <div className="flex items-center gap-1.5 pt-1">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[#D8D2C8]/60 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-7 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
