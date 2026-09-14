import { Skeleton } from "@/components/shared/skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-6 font-manrope">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#D8D2C8] dark:border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-2xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-72 rounded-md" />
            <Skeleton className="h-4 w-96 max-w-full rounded-md" />
          </div>
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-36 rounded-xl" />
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      {/* User Profile Card */}
      <div className="bg-white dark:bg-[#081C12] p-6 sm:p-8 rounded-2xl border border-[#D8D2C8] dark:border-white/10 shadow-sm dark:shadow-floating-dark space-y-6">
        <div className="flex items-center justify-between border-b border-[#D8D2C8] dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-3.5 w-48 rounded" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* 3 Detail Info Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#F9F7F7] dark:bg-white/5 p-4 rounded-xl border border-[#D8D2C8] dark:border-white/10 space-y-2">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-5 w-36 rounded" />
          </div>
          <div className="bg-[#F9F7F7] dark:bg-white/5 p-4 rounded-xl border border-[#D8D2C8] dark:border-white/10 space-y-2">
            <Skeleton className="h-3 w-28 rounded" />
            <Skeleton className="h-5 w-44 rounded" />
          </div>
          <div className="bg-[#F9F7F7] dark:bg-white/5 p-4 rounded-xl border border-[#D8D2C8] dark:border-white/10 space-y-2">
            <Skeleton className="h-3 w-24 rounded" />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-7 w-12 rounded-lg" />
              <Skeleton className="h-7 w-12 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Matrix Card */}
      <div className="bg-white dark:bg-[#081C12] p-6 sm:p-8 rounded-2xl border border-[#D8D2C8] dark:border-white/10 shadow-sm dark:shadow-floating-dark space-y-4">
        <div className="border-b border-[#D8D2C8] dark:border-white/10 pb-3">
          <Skeleton className="h-5 w-56 rounded" />
          <Skeleton className="h-3.5 w-80 rounded mt-1.5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#F9F7F7] dark:bg-white/5 p-4 rounded-xl border border-[#D8D2C8] dark:border-white/10 space-y-2">
              <Skeleton className="h-5 w-28 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-4/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
