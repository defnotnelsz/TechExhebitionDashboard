import { Skeleton } from "@/components/shared/skeleton";

export default function QueuesLoading() {
  return (
    <div className="space-y-6 font-manrope">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D8D2C8] dark:border-white/10 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* Queue 3-Column Card Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#081C12] rounded-[12px] border-[1.5px] border-[#D8D2C8] dark:border-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.05)] dark:shadow-floating-dark flex flex-col justify-between overflow-hidden"
          >
            {/* Card Header area */}
            <div className="p-4 pl-6 pb-0 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-5 w-16 rounded-[6px]" />
                <Skeleton className="h-5 w-20 rounded-[6px]" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                <Skeleton className="h-3.5 w-24 rounded" />
              </div>
            </div>

            {/* Header Area */}
            <div className="p-5 pl-6 pt-3 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-28 rounded" />
                  <Skeleton className="h-3 w-36 rounded" />
                </div>
                <Skeleton className="h-12 w-12 rounded-[8px]" />
              </div>

              {/* Title */}
              <Skeleton className="h-6 w-5/6 rounded" />

              {/* Location & Venue */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3.5 w-3.5 rounded-full" />
                  <Skeleton className="h-3.5 w-48 rounded" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3.5 w-3.5 rounded-full" />
                  <Skeleton className="h-3.5 w-40 rounded" />
                </div>
              </div>

              {/* Business line chips */}
              <div className="flex items-center gap-1.5 pt-1">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>

              {/* Strategic Insights Box */}
              <div className="bg-[#F9F7F7] dark:bg-white/5 p-3 rounded-lg border border-[#D8D2C8] dark:border-white/10 space-y-1.5">
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-4/5 rounded" />
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="p-4 pl-6 bg-[#F9F7F7] dark:bg-white/5 border-t border-[#D8D2C8] dark:border-white/10 flex items-center justify-between gap-3">
              <Skeleton className="h-8 w-24 rounded-[8px]" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20 rounded-[8px]" />
                <Skeleton className="h-8 w-24 rounded-[8px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
