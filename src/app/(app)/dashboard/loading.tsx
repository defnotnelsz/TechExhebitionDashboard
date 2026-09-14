import { Skeleton } from "@/components/shared/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 font-manrope">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#D8D2C8] dark:border-white/10">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-md" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
      </div>

      {/* Row 1 — 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#081C12] p-5 rounded-[12px] border-[1.5px] border-[#D8D2C8] dark:border-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.05)] dark:shadow-floating-dark space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-24 rounded" />
            <Skeleton className="h-3 w-36 rounded" />
          </div>
        ))}
      </div>

      {/* Row 2 — Charts (Monthly Timeline 8-col & Regional Donut 4-col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-white dark:bg-[#081C12] p-5 rounded-[12px] border-[1.5px] border-[#D8D2C8] dark:border-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.05)] dark:shadow-floating-dark space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#D8D2C8] dark:border-white/10 pb-3">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="lg:col-span-4 bg-white dark:bg-[#081C12] p-5 rounded-[12px] border-[1.5px] border-[#D8D2C8] dark:border-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.05)] dark:shadow-floating-dark space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center border-b border-[#D8D2C8] dark:border-white/10 pb-3">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <div className="flex items-center justify-center h-64">
            <Skeleton className="h-44 w-44 rounded-full" />
          </div>
        </div>
      </div>

      {/* Row 3 — Charts (Business Lines 7-col & Fit Score 5-col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-[#081C12] p-5 rounded-[12px] border-[1.5px] border-[#D8D2C8] dark:border-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.05)] dark:shadow-floating-dark space-y-4">
          <div className="flex justify-between items-center border-b border-[#D8D2C8] dark:border-white/10 pb-3">
            <Skeleton className="h-5 w-52 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <Skeleton className="h-60 w-full rounded-lg" />
        </div>
        <div className="lg:col-span-5 bg-white dark:bg-[#081C12] p-5 rounded-[12px] border-[1.5px] border-[#D8D2C8] dark:border-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.05)] dark:shadow-floating-dark space-y-4">
          <div className="flex justify-between items-center border-b border-[#D8D2C8] dark:border-white/10 pb-3">
            <Skeleton className="h-5 w-44 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <Skeleton className="h-60 w-full rounded-lg" />
        </div>
      </div>

      {/* Row 4 — Gaps & Alerts (5-col Coverage Gaps & 7-col Recent Events) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-[#081C12] p-5 rounded-[12px] border-[1.5px] border-[#D8D2C8] dark:border-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.05)] dark:shadow-floating-dark space-y-4">
          <div className="flex justify-between items-center border-b border-[#D8D2C8] dark:border-white/10 pb-3">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-[#081C12] p-5 rounded-[12px] border-[1.5px] border-[#D8D2C8] dark:border-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.05)] dark:shadow-floating-dark flex flex-col justify-between font-manrope space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8D2C8] dark:border-white/10 pb-3">
            <div className="space-y-1">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-3.5 w-64 rounded" />
            </div>
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="py-2.5 px-2 flex items-center justify-between gap-3">
                <Skeleton className="h-10 w-1 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-40 rounded" />
                  <Skeleton className="h-4 w-60 rounded" />
                  <Skeleton className="h-3 w-32 rounded" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
