import { Skeleton } from "@/components/shared/skeleton";

export default function AppLoading() {
  return (
    <div className="space-y-6 font-manrope">
      {/* Top Header Bar Skeleton */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D8D2C8] dark:border-white/10 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 rounded-md" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Main Content Grid / Card Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#081C12] p-5 rounded-xl border border-[#D8D2C8] dark:border-white/10 shadow-xs dark:shadow-floating-dark space-y-4"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-12 w-full rounded" />
            <div className="pt-2 flex items-center justify-between border-t border-[#D8D2C8]/50 dark:border-white/10">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
