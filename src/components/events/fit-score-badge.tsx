"use client";

import { useTranslation } from "@/lib/i18n/use-translation";

interface FitScoreBadgeProps {
  score: number;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showLevel?: boolean;
}

export function FitScoreBadge({ score, className = "", size = "md", showLevel = false }: FitScoreBadgeProps) {
  const { locale } = useTranslation();

  let indicator = "Low";
  let fullLabel = "Low Fit";
  let bgClass = "bg-[#708E7C]";

  if (score >= 4) {
    indicator = locale === "zh" ? "高" : "High";
    bgClass = score >= 5 ? "bg-[#133020]" : "bg-[#046241]";
    fullLabel =
      score >= 5
        ? locale === "zh"
          ? "直接匹配"
          : "Direct Fit"
        : locale === "zh"
        ? "高度契合"
        : "Strong Fit";
  } else if (score === 3) {
    indicator = locale === "zh" ? "中" : "Mid";
    bgClass = "bg-[#C17110]";
    fullLabel = locale === "zh" ? "中度契合" : "Moderate Fit";
  } else {
    indicator = locale === "zh" ? "低" : "Low";
    bgClass = "bg-[#708E7C]";
    fullLabel = locale === "zh" ? "基础契合" : "Low Fit";
  }

  const sizeStyle =
    size === "xl"
      ? "w-10 h-10 rounded-[10px] text-lg font-bold"
      : size === "lg"
      ? "w-9 h-9 rounded-[8px] text-base"
      : size === "sm"
      ? "w-6 h-6 rounded-[6px] text-xs"
      : "w-8 h-8 rounded-[8px] text-[15px]";

  if (showLevel) {
    const minW = size === "xl" ? "min-w-[48px] px-2.5 py-1.5" : "min-w-[44px] px-2 py-1";
    const numSize = size === "xl" ? "text-base" : "text-sm";
    const labelSize = size === "xl" ? "text-[10px]" : "text-[9px]";

    return (
      <div
        title={
          locale === "zh"
            ? `战略适配度：${score}/5 (${fullLabel})`
            : `Fit score: ${score}/5 (${fullLabel})`
        }
        className={`${minW} rounded-[8px] ${bgClass} text-white font-manrope flex flex-col items-center justify-center shadow-[0_1px_4px_rgba(0,0,0,0.1)] border border-white/20 shrink-0 select-none ${className}`}
      >
        <span className={`${numSize} font-extrabold leading-none`}>{score}</span>
        <span className={`${labelSize} font-bold uppercase tracking-wider mt-0.5 leading-none text-white/90`}>
          {indicator}
        </span>
      </div>
    );
  }

  return (
    <div
      title={
        locale === "zh"
          ? `战略适配度：${score}/5 (${fullLabel})`
          : `Fit score: ${score}/5 (${fullLabel})`
      }
      className={`${sizeStyle} ${bgClass} text-white font-manrope font-semibold flex items-center justify-center shadow-[0_1px_4px_rgba(0,0,0,0.1)] border border-white/20 shrink-0 select-none ${className}`}
    >
      {score}
    </div>
  );
}
