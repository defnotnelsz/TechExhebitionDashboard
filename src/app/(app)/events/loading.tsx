import { Skeleton } from "@/components/shared/skeleton";

export default function EventsLoading() {
  return (
    <div className="space-y-6 font-manrope">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D8D2C8] dark:border-white/10 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-60 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-white dark:bg-[#081C12] p-4 rounded-xl border border-[#D8D2C8] dark:border-white/10 shadow-xs dark:shadow-floating-dark flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 flex-1 min-w-[220px] rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Card Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#081C12] p-5 rounded-[12px] border-[1.5px] border-[#D8D2C8] dark:border-white/10 shadow-xs dark:shadow-floating-dark space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header: Date / Region & Fit Score Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
                <Skeleton className="h-9 w-9 rounded-[8px]" />
              </div>

              {/* Title */}
              <Skeleton className="h-5 w-4/5 rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />

              {/* Location Pin */}
              <div className="flex items-center gap-2 pt-1">
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                <Skeleton className="h-3.5 w-36 rounded" />
              </div>
            </div>

            {/* Chips & Footer */}
            <div className="space-y-3 pt-3 border-t border-[#D8D2C8]/50 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-7 w-20 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
