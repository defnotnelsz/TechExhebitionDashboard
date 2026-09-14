import { Skeleton } from "@/components/shared/skeleton";

export default function ReportsLoading() {
  return (
    <div className="space-y-8 font-manrope">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D8D2C8] dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-10 h-10 rounded-2xl" />
            <Skeleton className="h-8 w-64 rounded-md" />
          </div>
          <Skeleton className="h-4 w-96 max-w-full rounded-md mt-1.5" />
        </div>
      </div>

      {/* Report Configuration Card */}
      <div className="bg-white dark:bg-[#081C12] p-8 sm:p-10 rounded-xl border border-[#D8D2C8] dark:border-white/10 shadow-xs dark:shadow-floating-dark space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Skeleton className="h-11 w-44 rounded-xl" />
        </div>
      </div>

      {/* Preview Container Skeleton */}
      <div className="bg-white dark:bg-[#081C12] p-8 rounded-xl border border-[#D8D2C8] dark:border-white/10 shadow-xs dark:shadow-floating-dark space-y-4">
        <div className="flex justify-between items-center border-b border-[#D8D2C8] dark:border-white/10 pb-3">
          <Skeleton className="h-6 w-52 rounded" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  );
}
