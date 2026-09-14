interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[#D8D2C8]/60 dark:bg-white/10 rounded-lg ${className}`}
    />
  );
}