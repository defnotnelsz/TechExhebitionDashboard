"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Bot,
  Play,
  Square,
  ExternalLink,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  Globe,
  Loader2,
  PlusCircle,
  Layers,
  ArrowRight,
  Trash2,
  Filter,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { FitScoreBadge } from "./fit-score-badge";
import { PriorityIndicator } from "./priority-indicator";
import { BusinessLineChip } from "./business-line-chip";
import { LifewoodMultiSelect } from "@/components/shared/lifewood-multi-select";
import { toast } from "sonner";
import { sanitizeEventUrl } from "@/lib/url";
import { useTranslation } from "@/lib/i18n/use-translation";
import { localizeEvent } from "@/lib/i18n/event-localization";
import {
  ALL_COUNTRIES,
  REGION_OPTIONS,
  getCountriesByRegion,
  getRegionByCountry,
} from "@/lib/constants/countries";

export interface EventRecord {
  no: number;
  region?: string;
  country: string;
  city: string;
  event_name: string;
  dates: string;
  venue?: string;
  location_address?: string;
  official_website: string;
  organizer?: string;
  event_category?: string;
  business_lines: string;
  strategic_focus?: string;
  relevance_lifewood?: string;
  target_audience?: string;
  estimated_attendees?: string;
  exhibitor_sponsor_opportunity?: string;
  booth_sponsorship_cost: string;
  registration_deadline?: string;
  contact_email?: string;
  contact_person?: string;
  linkedin_social_media?: string;
  participation_recommendation: string;
  fit_score: number;
  priority_level: string;
  key_notes?: string;
  source_links?: string;
  is_duplicate?: boolean;
  duplicate_reason?: string;
  duplicate_of?: string;
}

const YEAR_OPTIONS = [
  { value: "2026", label: "2026" },
  { value: "2027", label: "2027" },
  { value: "2028", label: "2028" },
  { value: "2029", label: "2029" },
  { value: "2030", label: "2030" },
];

const MONTH_OPTIONS = [
  { value: "January", label: "January" },
  { value: "February", label: "February" },
  { value: "March", label: "March" },
  { value: "April", label: "April" },
  { value: "May", label: "May" },
  { value: "June", label: "June" },
  { value: "July", label: "July" },
  { value: "August", label: "August" },
  { value: "September", label: "September" },
  { value: "October", label: "October" },
  { value: "November", label: "November" },
  { value: "December", label: "December" },
];

const COUNTRY_OPTIONS = ALL_COUNTRIES;

// Helper to calculate default date window: execution date + 1 month ahead (strictly >= 2026)
function calculateTargetDateWindow() {
  const executionDate = new Date();
  if (executionDate.getFullYear() < 2026) {
    executionDate.setFullYear(2026);
  }
  const targetDate = new Date(executionDate);
  targetDate.setMonth(targetDate.getMonth() + 1);
  if (targetDate.getFullYear() < 2026) {
    targetDate.setFullYear(2026);
  }

  const monthNamesEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const targetMonth = monthNamesEn[targetDate.getMonth()];
  const targetYear = Math.max(2026, targetDate.getFullYear()).toString();

  return {
    executionDate,
    targetDate,
    targetMonth,
    targetYear,
  };
}

export default function EventScraperDashboard() {
  const { locale, t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [statusText, setStatusText] = useState("");
  const [candidateUrls, setCandidateUrls] = useState<string[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);

  // Target Date Window (+1 month ahead from execution date, strictly >= 2026)
  const initialWindow = useRef(calculateTargetDateWindow()).current;

  // Preset Filters (start with no pre-filled target for region & country)
  const [selectedYears, setSelectedYears] = useState<string[]>([
    parseInt(initialWindow.targetYear, 10) >= 2026 ? initialWindow.targetYear : "2026",
  ]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([initialWindow.targetMonth || "January"]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

  // Optional Text Search
  const [optionalPrompt, setOptionalPrompt] = useState("");

  // Pagination state (default 10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [acceptedEvents, setAcceptedEvents] = useState<Record<string, boolean>>({});
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "unique" | "duplicates">("all");

  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const uniqueCount = events.filter((e) => !e.is_duplicate).length;
  const duplicateCount = events.filter((e) => e.is_duplicate).length;

  const displayedEvents = events.filter((e) => {
    if (filterMode === "unique") return !e.is_duplicate;
    if (filterMode === "duplicates") return e.is_duplicate;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(displayedEvents.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEvents = displayedEvents.slice(startIndex, startIndex + pageSize);

  // Dynamic query builder combining presets, region, countries, and optional prompt
  const buildScrapeQuery = () => {
    const parts: string[] = [];

    if (optionalPrompt.trim()) {
      parts.push(optionalPrompt.trim());
    } else {
      parts.push("tech exhibition");
    }

    if (selectedMonths.length > 0) {
      parts.push(selectedMonths.join(" OR "));
    }

    // Strictly ensure no year below 2026 is included
    const validYears = selectedYears.filter((y) => parseInt(y, 10) >= 2026);
    if (validYears.length > 0) {
      parts.push(validYears.join(" OR "));
    } else {
      parts.push("2026");
    }

    if (selectedCountries.length > 0) {
      if (selectedCountries.length > 8) {
        if (selectedRegion && selectedRegion !== "All Regions") {
          parts.push(`"${selectedRegion}"`);
        } else {
          parts.push(selectedCountries.slice(0, 5).map((c) => `"${c}"`).join(" OR "));
        }
      } else {
        parts.push(selectedCountries.map((c) => `"${c}"`).join(" OR "));
      }
    } else if (selectedRegion && selectedRegion !== "All Regions") {
      parts.push(`"${selectedRegion}"`);
    }

    return parts.join(" ");
  };

  // Load previously cached events on initial mount
  useEffect(() => {
    async function loadCache() {
      try {
        const res = await fetch("http://localhost:5000/api/crawl-events/cache");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.length > 0) {
            setEvents(json.data);
          }
        }
      } catch {
        // Silent catch if engine is not running yet
      }
    }
    loadCache();
  }, []);

  // Timer while crawling
  useEffect(() => {
    if (loading) {
      setElapsedSeconds(0);
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    toast.info(`Stopped crawl. Preserved ${events.length} event(s) already scraped on screen!`);
  };

  const handleCrawl = async () => {
    setLoading(true);
    setCurrentStep(1);
    setStatusText("Initiating Google Search Discovery via Apify...");
    setCandidateUrls([]);
    // Retain existing event details on screen; append newly discovered items

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const effectiveQuery = buildScrapeQuery();

    const requestPayload = {
      query: effectiveQuery,
      existingEvents: events,
      targetWindow: {
        executionDate: initialWindow.executionDate.toISOString(),
        targetDate: initialWindow.targetDate.toISOString(),
      },
      filters: {
        years: selectedYears.filter((y) => parseInt(y, 10) >= 2026),
        months: selectedMonths,
        region: selectedRegion,
        countries: selectedCountries,
        optionalPrompt: optionalPrompt.trim(),
      },
    };

    try {
      // Prefer proxy /api/crawl-events with streaming Accept header
      let res: Response;
      try {
        res = await fetch("http://localhost:5000/api/crawl-events?stream=true", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify(requestPayload),
          signal: controller.signal,
        });
      } catch {
        res = await fetch("/api/crawl-events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify(requestPayload),
          signal: controller.signal,
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      // Check if response is Server-Sent Events stream
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const chunk of parts) {
            const trimmed = chunk.trim();
            if (!trimmed) continue;
            const match = trimmed.match(/^data:\s*(.+)$/m);
            if (!match) continue;

            try {
              const payload = JSON.parse(match[1]);

              if (payload.type === "status") {
                setStatusText(payload.message);
                if (payload.step) setCurrentStep(payload.step);
              } else if (payload.type === "candidates") {
                setCandidateUrls(payload.urls || []);
                setStatusText(payload.message);
                setCurrentStep(2);
              } else if (payload.type === "auditing") {
                setStatusText(payload.message);
                setCurrentStep(3);
              } else if (payload.type === "event") {
                // 🌟 REAL-TIME EVENT STREAMED DIRECTLY TO SCREEN!
                const incoming = payload.data;
                setEvents((prev) => {
                  const idx = prev.findIndex(
                    (p) =>
                      p.event_name.toLowerCase() === incoming.event_name.toLowerCase() &&
                      (p.city?.toLowerCase() === incoming.city?.toLowerCase() || !p.city || !incoming.city)
                  );
                  if (idx !== -1) {
                    const updated = [...prev];
                    updated[idx] = { ...updated[idx], ...incoming };
                    return updated;
                  }
                  return [...prev, { ...incoming, no: prev.length + 1 }];
                });
                if (incoming.is_duplicate) {
                  toast.warning(
                    locale === "zh"
                      ? `检测到重复: ${incoming.event_name} (${incoming.duplicate_reason || "已录入系统"})`
                      : `Duplicate: ${incoming.event_name} (${incoming.duplicate_reason || "Already recorded"})`
                  );
                } else {
                  toast.success(
                    locale === "zh"
                      ? `发现新展会: ${incoming.event_name} (适配度 ${incoming.fit_score}/5)`
                      : `Found: ${incoming.event_name} (Fit ${incoming.fit_score}/5)`
                  );
                }
              } else if (payload.type === "done") {
                setStatusText(payload.message || (locale === "zh" ? "抓取完成！" : "Crawl finished!"));
                setCurrentStep(3);
                toast.success(
                  `Crawl complete! ${payload.uniqueCount || 0} unique events processed.`
                );
              } else if (payload.type === "error") {
                toast.error(
                  locale === "zh"
                    ? `采集器错误: ${payload.error}`
                    : `Crawler Error: ${payload.error}`
                );
              }
            } catch (parseErr) {
              console.warn("Could not parse SSE payload chunk:", parseErr);
            }
          }
        }
      } else {
        // Fallback standard JSON response
        const result = await res.json();
        if (result.success) {
          const incomingList: EventRecord[] = result.data || [];
          setEvents((prev) => {
            const merged = [...prev];
            for (const item of incomingList) {
              const idx = merged.findIndex(
                (p) =>
                  p.event_name.toLowerCase() === item.event_name.toLowerCase() &&
                  (p.city?.toLowerCase() === item.city?.toLowerCase() || !p.city || !item.city)
              );
              if (idx !== -1) {
                merged[idx] = { ...merged[idx], ...item };
              } else {
                merged.push({ ...item, no: merged.length + 1 });
              }
            }
            return merged;
          });
          toast.success(`Discovered ${result.uniqueCount || incomingList.length} unique records`);
        } else {
          toast.error(
            locale === "zh"
              ? `采集器错误: ${result.error}`
              : `Crawler error: ${result.error}`
          );
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.log("Crawl manually aborted by user.");
      } else {
        toast.error(
          locale === "zh"
            ? `采集服务未响应: ${err.message}。请确保后台服务正在运行。`
            : `Engine unreachable: ${err.message}. Ensure "node server.js" is running.`
        );
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Clear crawler disk cache
  const handleClearCache = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/crawl-events/cache", {
        method: "DELETE",
      });
      if (res.ok) {
        setEvents([]);
        toast.success(locale === "zh" ? "采集器缓存已成功清空。" : "Crawler cache cleared successfully.");
      } else {
        toast.error(locale === "zh" ? "未能清空采集器缓存。" : "Could not clear crawler cache.");
      }
    } catch {
      toast.error(locale === "zh" ? "连接采集器端口 5000 失败。" : "Failed to reach crawler on port 5000.");
    }
  };

  // Accept single event and send directly to review queue
  const handleAcceptEvent = async (event: EventRecord) => {
    setAcceptingId(event.event_name);
    try {
      const res = await fetch("/api/scraper/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: event.event_name,
          region: event.region,
          country: event.country,
          city: event.city,
          dates: event.dates,
          venue: event.venue,
          locationAddress: event.location_address,
          officialWebsite:
            sanitizeEventUrl(event.official_website, event.source_links) ||
            "https://",
          organizer: event.organizer,
          eventCategory: event.event_category,
          businessLines: event.business_lines
            ? event.business_lines.split(",").map((s) => s.trim())
            : ["Global AI Data"],
          strategicFocus: event.strategic_focus,
          relevanceToLifewood: event.relevance_lifewood,
          targetAudience: event.target_audience,
          estimatedAttendees: event.estimated_attendees,
          boothCost: event.booth_sponsorship_cost,
          participationRec: event.participation_recommendation || "Exhibit",
          priorityLevel: event.priority_level || "High",
          fitScore: event.fit_score || 4,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Automatically remove the accepted event from the scraped list!
        setEvents((prev) =>
          prev.filter(
            (item) =>
              item.event_name.toLowerCase().trim() !==
              event.event_name.toLowerCase().trim()
          )
        );

        // Also remove from crawler cache file so it does not reappear on reload
        try {
          fetch("http://localhost:5000/api/crawl-events/cache/item", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventName: event.event_name }),
          }).catch(() => {});
        } catch {}

        if (data.isDuplicate) {
          toast.info(
            data.message ||
              (locale === "zh"
                ? `“${event.event_name}”已存在于数据库中，已从待审核列表中移除。`
                : `"${event.event_name}" already exists in the database and was removed from scraped queue.`)
          );
        } else {
          toast.success(
            locale === "zh"
              ? `“${event.event_name}”已采纳并转移至审核队列！`
              : `"${event.event_name}" accepted and transferred to Review Queue!`
          );
        }
      } else {
        toast.error(data.error || (locale === "zh" ? "采纳展会失败" : "Failed to accept event"));
      }
    } catch {
      toast.error(locale === "zh" ? "提交展会至审核队列异常" : "Error submitting event to queue");
    } finally {
      setAcceptingId(null);
    }
  };

  // Dismiss / Remove event from scraped list without queuing
  const handleDismissEvent = (event: EventRecord) => {
    setEvents((prev) =>
      prev.filter(
        (item) =>
          item.event_name.toLowerCase().trim() !==
          event.event_name.toLowerCase().trim()
      )
    );

    try {
      fetch("http://localhost:5000/api/crawl-events/cache/item", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventName: event.event_name }),
      }).catch(() => {});
    } catch {}

    toast.info(
      locale === "zh"
        ? `已从采集列表中移除“${event.event_name}”`
        : `Removed "${event.event_name}" from scraped list.`
    );
  };

  // Bulk Accept All Unique
  const handleAcceptAll = async () => {
    const uniqueToAccept = events.filter((e) => !e.is_duplicate);
    if (uniqueToAccept.length === 0) {
      toast.info(locale === "zh" ? "暂无可转移的唯一展会记录。" : "No unique events to transfer.");
      return;
    }

    toast.info(
      locale === "zh"
        ? `正在转移 ${uniqueToAccept.length} 场唯一展会至审核队列...`
        : `Transferring ${uniqueToAccept.length} unique events to Review Queue...`
    );
    for (const evt of uniqueToAccept) {
      await handleAcceptEvent(evt);
    }
  };

  return (
    <div className="p-6 font-manrope space-y-5 bg-white">
      {/* Header bar */}
      <div className="flex items-start justify-between flex-wrap gap-4 border-b border-[#D8D2C8] dark:border-[#1E4830] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-[18px] font-semibold text-[#133020] dark:text-black">
              {locale === "zh"
                ? "科技展会智能发现与抓取引擎"
                : "Tech exhibition discovery engine"}
            </h2>
          </div>
          <p className="text-[12px] text-[#666666] dark:text-black/60">
            {locale === "zh"
              ? "目标范围：2026年9月1日 – 2027年12月31日 · 自动化 27 维度审计 · 最低适配度 3+ 阈值要求"
              : "Target scope: Sep 1, 2026 – Dec 31, 2027 · Automated 27-column audit · Minimum Fit 3+ enforcement"}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {events.length > 0 && (
            <span className="font-semibold text-[#046241] bg-[#046241]/10 px-2.5 py-1 rounded-full">
              {locale === "zh"
                ? `${events.length} 场已验证展会`
                : `${events.length} verified event(s)`}
            </span>
          )}
        </div>
      </div>

      {/* Target Date Window & Preset Filters Control Card */}
      <div className="bg-[#fcfdfc] border border-[#e5e7eb] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
        {/* Target Date Window Banner */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#e6f4ea] text-[#0f5132] flex items-center justify-center border border-[#d1e7dd] shrink-0">
              <Calendar className="w-4 h-4 text-[#0f5132]" />
            </div>
            <div className="flex items-center flex-wrap text-sm">
              <span className="font-normal text-[#1f2937]">
                {locale === "zh" ? "自动化抓取目标时间窗口：" : "Target Scraping Date Window:"}
              </span>
              <span className="ml-2 font-semibold text-[#046241]">
                {initialWindow.executionDate.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
                {" – "}
                {initialWindow.targetDate.toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#eaf5ee] text-[#0f5132] text-xs font-medium border border-[#cbe5d5]">
            {locale === "zh" ? "默认目标窗口：执行日 +1 个月" : "Default Target: +1 Month Ahead"}
          </span>
        </div>

        {/* Preset Filters (4-Column Layout: Year | Month | Country | Region) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LifewoodMultiSelect
            label={locale === "zh" ? "目标年份" : "Target Year"}
            placeholder={locale === "zh" ? "选择年份..." : "Select Year..."}
            options={YEAR_OPTIONS}
            selected={selectedYears}
            onChange={(val) => {
              const valid = val.filter((y) => parseInt(y, 10) >= 2026);
              setSelectedYears(valid.length > 0 ? valid : ["2026"]);
              setCurrentPage(1);
            }}
          />

          <LifewoodMultiSelect
            label={locale === "zh" ? "目标月份" : "Target Month"}
            placeholder={locale === "zh" ? "选择月份..." : "Select Month..."}
            options={MONTH_OPTIONS}
            selected={selectedMonths}
            onChange={(val) => {
              setSelectedMonths(val);
              setCurrentPage(1);
            }}
          />

          <LifewoodMultiSelect
            label={locale === "zh" ? "目标国家" : "Target Country"}
            placeholder={locale === "zh" ? "无目标国家 (不限)" : "No Target Country"}
            options={COUNTRY_OPTIONS}
            selected={selectedCountries}
            onChange={(val) => {
              setSelectedCountries(val);
              // Auto-sync region if all selected countries belong to a region or if single country
              if (val.length === 1) {
                const reg = getRegionByCountry(val[0]);
                if (reg) setSelectedRegion(reg);
              }
              setCurrentPage(1);
            }}
            searchable={true}
            activeRegion={selectedRegion}
            onSelectAllRegion={
              selectedRegion && selectedRegion !== "All Regions"
                ? () => {
                    const regionCountries = getCountriesByRegion(selectedRegion);
                    setSelectedCountries(regionCountries);
                  }
                : undefined
            }
          />

          <LifewoodMultiSelect
            label={locale === "zh" ? "目标大区" : "Target Region"}
            placeholder={locale === "zh" ? "无目标大区 (不限)" : "No Target Region"}
            options={REGION_OPTIONS}
            selected={selectedRegion ? [selectedRegion] : []}
            singleSelect={true}
            onChange={(val) => {
              const regionName = val[0] || "";
              setSelectedRegion(regionName);
              if (regionName) {
                const countriesInRegion = getCountriesByRegion(regionName);
                setSelectedCountries(countriesInRegion);
                toast.success(
                  locale === "zh"
                    ? `已选定【${regionName}】：自动选取该区域 ${countriesInRegion.length} 个国家。您可在【目标国家】中随时增删！`
                    : `Selected ${regionName}: Automatically picked all ${countriesInRegion.length} countries. You can add or remove countries in Target Country!`
                );
              } else {
                toast.info(
                  locale === "zh"
                    ? "已切换为【无目标大区】"
                    : "Set to No Target Region."
                );
              }
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Optional Text Search & Scrape Action Button */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#4b5563]">
            {locale === "zh" ? "可选关键词提示" : "Optional keyword prompt"}
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={optionalPrompt}
                onChange={(e) => setOptionalPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading && handleCrawl()}
                placeholder={
                  locale === "zh"
                    ? "可选关键词提示（如：AI, Healthcare, IoT - 选填）..."
                    : "e.g. AI, Healthcare, IoT - strictly optional..."
                }
                className="w-full h-[42px] px-3.5 rounded-xl border border-[#d1d5db] dark:border-white/15 bg-white dark:bg-white/5 text-sm text-[#111827] dark:text-white placeholder-[#9ca3af] dark:placeholder-white/40 focus:outline-none focus:border-[#046241] focus:ring-1 focus:ring-[#046241] transition-all"
              />
            </div>

            {!loading ? (
              <button
                onClick={handleCrawl}
                className="h-[42px] px-5 rounded-xl bg-[#046241] hover:bg-[#034d33] text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>
                  {locale === "zh" ? "开始抓取" : "Start Scraping"}
                </span>
              </button>
            ) : (
              <button
                onClick={handleStop}
                className="h-[42px] px-4 rounded-xl bg-[#be4b49] hover:bg-[#a83f3e] text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer animate-pulse"
                title="Stop crawl and keep whatever events were already discovered"
              >
                <Square className="w-3.5 h-3.5 fill-white text-white" />
                <span>
                  {locale === "zh"
                    ? `停止并保留 (${events.length})`
                    : `Stop & keep (${events.length})`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time User Experience & Progress Stepper */}
      {loading && (
        <div className="bg-[#F5EEDB]/60 dark:bg-white/5 border border-[#D8D2C8] dark:border-white/10 rounded-[10px] p-4.5 space-y-3.5 transition-all">
          {/* Top Status line + Elapsed Stopwatch */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 text-[#046241] dark:text-emerald-400 animate-spin shrink-0" />
              <span className="text-xs font-semibold text-[#133020] dark:text-white">
                {statusText ||
                  (locale === "zh" ? "正在智能发现展会..." : "Discovering exhibitions...")}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#133020] dark:text-white bg-white dark:bg-white/10 px-2.5 py-1 rounded-[6px] border border-[#D8D2C8] dark:border-white/15 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-[#C17110] dark:text-amber-400" />
              <span>
                {locale === "zh" ? "耗时：" : "Elapsed: "}
                {formatTimer(elapsedSeconds)}
              </span>
            </div>
          </div>

          {/* Stepper Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {/* Step 1 */}
            <div
              className={`p-3 rounded-[8px] border text-xs transition ${
                currentStep >= 1
                  ? "bg-white dark:bg-[#081C12] border-[#046241] text-[#133020] dark:text-white shadow-xs dark:shadow-floating-dark"
                  : "bg-white/50 dark:bg-white/5 border-[#D8D2C8] dark:border-white/10 text-[#999999] dark:text-white/40"
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {currentStep > 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-[#046241] dark:text-emerald-400" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-[#046241] text-white text-[10px] flex items-center justify-center font-bold">
                    1
                  </span>
                )}
                <span>
                  {locale === "zh" ? "1. 搜索引擎智能发现" : "1. Google Discovery"}
                </span>
              </div>
              <p className="text-[11px] text-[#666666] dark:text-white/60 mt-1 pl-6">
                {locale === "zh"
                  ? "多引擎并发扫描全球展会官方候选站点"
                  : "Organic candidate event search via Apify"}
              </p>
            </div>

            {/* Step 2 */}
            <div
              className={`p-3 rounded-[8px] border text-xs transition ${
                currentStep >= 2
                  ? "bg-white dark:bg-[#081C12] border-[#046241] text-[#133020] dark:text-white shadow-xs dark:shadow-floating-dark"
                  : "bg-white/50 dark:bg-white/5 border-[#D8D2C8] dark:border-white/10 text-[#999999] dark:text-white/40"
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {currentStep > 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-[#046241] dark:text-emerald-400" />
                ) : currentStep === 2 ? (
                  <Loader2 className="w-4 h-4 text-[#046241] dark:text-emerald-400 animate-spin" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-[#D8D2C8] dark:bg-white/20 text-[#666666] dark:text-white/60 text-[10px] flex items-center justify-center font-bold">
                    2
                  </span>
                )}
                <span>
                  {locale === "zh" ? "2. 高速页面并行抓取" : "2. High-Speed Crawl"}
                </span>
              </div>
              <p className="text-[11px] text-[#666666] dark:text-white/60 mt-1 pl-6">
                {locale === "zh"
                  ? "深度提取展会详情与正文内容"
                  : "Parallel page content extraction"}
              </p>
            </div>

            {/* Step 3 */}
            <div
              className={`p-3 rounded-[8px] border text-xs transition ${
                currentStep >= 3
                  ? "bg-white dark:bg-[#081C12] border-[#046241] text-[#133020] dark:text-white shadow-xs dark:shadow-floating-dark"
                  : "bg-white/50 dark:bg-white/5 border-[#D8D2C8] dark:border-white/10 text-[#999999] dark:text-white/40"
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {currentStep === 3 ? (
                  <Loader2 className="w-4 h-4 text-[#046241] dark:text-emerald-400 animate-spin" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-[#D8D2C8] dark:bg-white/20 text-[#666666] dark:text-white/60 text-[10px] flex items-center justify-center font-bold">
                    3
                  </span>
                )}
                <span>
                  {locale === "zh" ? "3. Gemini 智能对齐审计" : "3. Gemini AI Audit"}
                </span>
              </div>
              <p className="text-[11px] text-[#666666] dark:text-white/60 mt-1 pl-6">
                {locale === "zh"
                  ? "27个维度解析与战略适配度评分"
                  : "27-column audit & Fit Score calculation"}
              </p>
            </div>
          </div>

          {/* Candidate URLs Pill Chips */}
          {candidateUrls.length > 0 && (
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-[#666666] dark:text-white/60 block mb-1.5">
                {locale === "zh"
                  ? `发现候选展会网址 (${candidateUrls.length}):`
                  : `Found Candidate Exhibition URLs (${candidateUrls.length}):`}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {candidateUrls.map((u, i) => (
                  <a
                    key={i}
                    href={u}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-white dark:bg-white/5 border border-[#D8D2C8] dark:border-white/15 text-[11px] font-medium text-[#046241] dark:text-emerald-400 hover:text-[#133020] dark:hover:text-white hover:border-[#046241] transition truncate max-w-xs"
                  >
                    <Globe className="w-3 h-3 text-[#046241] dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{new URL(u).hostname}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter and Bulk Action Header when events are present */}
      {events.length > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="text-xs font-semibold text-[#133020] dark:text-white flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-[#046241] dark:text-emerald-400" />
              <span>{locale === "zh" ? "筛选：" : "Filter:"}</span>
            </div>

            {/* Filter Pills */}
            <div className="inline-flex rounded-lg border border-[#D8D2C8] bg-[#F9F7F7] p-0.5 text-xs">
              <button
                onClick={() => {
                  setFilterMode("all");
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                  filterMode === "all"
                    ? "bg-[#133020] text-white shadow-2xs font-semibold"
                    : "text-[#666666] hover:text-[#133020]"
                }`}
              >
                {locale === "zh" ? `全部展会 (${events.length})` : `All Events (${events.length})`}
              </button>
              <button
                onClick={() => {
                  setFilterMode("unique");
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1 ${
                  filterMode === "unique"
                    ? "bg-[#046241] text-white shadow-2xs font-semibold"
                    : "text-[#046241] hover:text-[#133020]"
                }`}
              >
                <span>{locale === "zh" ? "新增唯一" : "New Unique"}</span>
                <span className="bg-[#046241]/20 px-1 rounded-full text-[10px] font-bold">
                  {uniqueCount}
                </span>
              </button>
              <button
                onClick={() => {
                  setFilterMode("duplicates");
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1 ${
                  filterMode === "duplicates"
                    ? "bg-[#B87A00] text-white shadow-2xs font-semibold"
                    : "text-[#B87A00] hover:text-[#8C6B14]"
                }`}
              >
                <span>{locale === "zh" ? "重复项" : "Duplicates"}</span>
                <span className="bg-[#B87A00]/20 px-1 rounded-full text-[10px] font-bold">
                  {duplicateCount}
                </span>
              </button>
            </div>

            {loading && (
              <span className="text-[11px] text-[#046241] animate-pulse font-normal ml-2">
                {locale === "zh" ? "(实时数据流抓取中...)" : "(Streaming in real time...)"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearCache}
              className="px-2.5 py-1.5 border border-[#D8D2C8] hover:border-red-300 text-[#666666] hover:text-red-600 rounded-[6px] text-xs font-medium flex items-center gap-1 transition cursor-pointer"
              title={locale === "zh" ? "清空之前保存的抓取缓存" : "Clear previously saved crawler memory"}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{locale === "zh" ? "清空缓存" : "Clear Cache"}</span>
            </button>

            <button
              onClick={handleAcceptAll}
              disabled={uniqueCount === 0}
              className="px-3.5 py-1.5 bg-[#133020] hover:bg-[#046241] text-white hover:text-[#FFB347] rounded-[6px] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#FFB347]" />
              <span>
                {locale === "zh"
                  ? `采纳全部新增 (${uniqueCount})`
                  : `Accept All Unique (${uniqueCount})`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Results Table adhering to Section 6.7 with real-time updates */}
      <div className="overflow-x-auto rounded-[8px] border border-[#D8D2C8] bg-white shadow-2xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#133020] text-white text-[10.5px] uppercase tracking-[0.08em] font-semibold border-b border-[#133020]">
              <th className="py-3 px-3.5 text-center w-12">#</th>
              <th className="py-3 px-3.5 min-w-[220px]">
                {locale === "zh" ? "展会名称" : "Exhibition event"}
              </th>
              <th className="py-3 px-3.5 min-w-[120px]">
                {locale === "zh" ? "展会日期" : "Dates"}
              </th>
              <th className="py-3 px-3.5 min-w-[140px]">
                {locale === "zh" ? "地点" : "Location"}
              </th>
              <th className="py-3 px-3.5 min-w-[160px]">
                {locale === "zh" ? "业务线" : "Business lines"}
              </th>
              <th className="py-3 px-3.5 text-center w-16">
                {locale === "zh" ? "适配度" : "Fit"}
              </th>
              <th className="py-3 px-3.5 text-center w-24">
                {locale === "zh" ? "优先级" : "Priority"}
              </th>
              <th className="py-3 px-3.5 min-w-[110px]">
                {locale === "zh" ? "展位费用" : "Booth cost"}
              </th>
              <th className="py-3 px-3.5 text-right w-24">
                {locale === "zh" ? "官网链接" : "Link"}
              </th>
              <th className="py-3 px-3.5 text-right w-28">
                {locale === "zh" ? "审核操作" : "Queue Action"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D8D2C8] text-[#133020]">
            {displayedEvents.length === 0 && !loading ? (
              <tr>
                <td colSpan={10} className="text-center py-12 px-4 text-[#666666]">
                  <div className="max-w-xs mx-auto space-y-1">
                    <p className="font-semibold text-[#133020] text-[13px]">
                      {filterMode === "duplicates"
                        ? locale === "zh"
                          ? "未检测到重复展会记录"
                          : "No duplicate events detected"
                        : filterMode === "unique"
                        ? locale === "zh"
                          ? "未发现新展会记录"
                          : "No new unique events found"
                        : locale === "zh"
                        ? "暂无抓取到的展会记录"
                        : "No exhibition records crawled yet"}
                    </p>
                    <p className="text-[11px] text-[#666666]">
                      {filterMode !== "all"
                        ? locale === "zh"
                          ? "切换回“全部展会”可查看完整的发现列表。"
                          : "Switch back to 'All Events' to view the full discovery list."
                        : locale === "zh"
                        ? "在上方输入地理区域或产业关键词，即可触发自动化深度挖掘流程。"
                        : "Enter a geographic or industrial search query above to trigger automated discovery."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedEvents.map((rawEvt, idx) => {
                const e = localizeEvent(rawEvt, locale);

                let blArray: string[] = [];
                try {
                  blArray =
                    typeof e.business_lines === "string"
                      ? e.business_lines.split(",")
                      : [e.business_lines];
                } catch {
                  blArray = [e.business_lines];
                }

                const isAccepted = acceptedEvents[rawEvt.event_name];
                const isAccepting = acceptingId === rawEvt.event_name;
                const isDuplicate = Boolean(e.is_duplicate);

                return (
                  <tr
                    key={rawEvt.event_name + idx}
                    className={`transition-colors duration-150 animate-in fade-in duration-300 ${
                      isDuplicate
                        ? "bg-[#FCFAF6] hover:bg-[#F7F2E8]"
                        : "hover:bg-[#F0F5F2]"
                    }`}
                  >
                    <td className="py-3 px-3.5 text-center font-semibold text-[#666666]">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex items-start gap-1 flex-wrap">
                        <span className="font-semibold text-[#133020] block leading-snug">
                          {e.event_name}
                        </span>
                        {isDuplicate && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#8C6B14] bg-[#FDF4DC] border border-[#ECD189] px-2 py-0.5 rounded-full"
                            title={e.duplicate_reason || (locale === "zh" ? "数据库已存在" : "Already in system")}
                          >
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>{locale === "zh" ? "重复项" : "Duplicate"}</span>
                          </span>
                        )}
                      </div>
                      {isDuplicate && e.duplicate_reason && (
                        <span className="text-[10px] text-[#8C6B14] block mt-0.5 italic">
                          ↳ {e.duplicate_reason}
                        </span>
                      )}
                      {e.organizer && (
                        <span className="text-[11px] text-[#666666] block truncate mt-0.5">
                          {e.organizer}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-medium text-[#133020]">
                      {e.dates}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="font-medium text-[#133020]">
                        {e.city}, {e.country}
                      </span>
                      {e.region && (
                        <span className="text-[11px] text-[#666666] block">
                          {e.region}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1 flex-wrap">
                        {blArray.map((bl) => (
                          <BusinessLineChip key={bl.trim()} name={bl.trim()} />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex justify-center">
                        <FitScoreBadge score={e.fit_score} />
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <div className="flex justify-center">
                        <PriorityIndicator priority={e.priority_level} />
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-[11px] font-medium text-[#666666]">
                      {e.booth_sponsorship_cost || (locale === "zh" ? "未公开披露" : "Not disclosed")}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      {(() => {
                        const targetUrl = sanitizeEventUrl(
                          e.official_website,
                          e.source_links
                        );
                        if (!targetUrl) {
                          return (
                            <span className="text-[11px] text-[#999999]">
                              {locale === "zh" ? "暂无链接" : "No link"}
                            </span>
                          );
                        }
                        return (
                          <a
                            href={targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#046241] hover:text-[#133020] transition"
                          >
                            <span>{locale === "zh" ? "访问官网" : "Visit"}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-3.5 text-right whitespace-nowrap">
                      {isDuplicate ? (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#777777] bg-[#F0ECE1] px-2.5 py-1 rounded-full border border-[#D8D2C8]"
                            title={e.duplicate_reason || (locale === "zh" ? "该展会已收录在数据库中" : "Event already recorded in system")}
                          >
                            <span>{locale === "zh" ? "已收录记录" : "Existing Record"}</span>
                          </span>
                          <button
                            onClick={() => handleDismissEvent(rawEvt)}
                            title={locale === "zh" ? "从列表中移除" : "Dismiss from list"}
                            className="p-1 text-[#777777] hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleAcceptEvent(rawEvt)}
                            disabled={isAccepting}
                            className="px-2.5 py-1 bg-[#046241] hover:bg-[#133020] text-white rounded-[6px] text-[11px] font-semibold transition cursor-pointer disabled:opacity-50"
                          >
                            {isAccepting
                              ? locale === "zh"
                                ? "转移中..."
                                : "Moving..."
                              : locale === "zh"
                              ? "+ 采纳"
                              : "+ Accept"}
                          </button>
                          <button
                            onClick={() => handleDismissEvent(rawEvt)}
                            title={locale === "zh" ? "从列表中移除" : "Dismiss from list"}
                            className="p-1 text-[#777777] hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Table Pagination Controls */}
        {displayedEvents.length > 0 && (
          <div className="flex items-center justify-between flex-wrap gap-3 px-4 py-3 border-t border-[#D8D2C8] bg-[#F9F7F7] text-xs font-manrope">
            <div className="flex items-center gap-2 text-[#666666]">
              <span className="font-medium">
                {locale === "zh"
                  ? `显示第 ${startIndex + 1}–${Math.min(startIndex + pageSize, displayedEvents.length)} 场，共 ${displayedEvents.length} 场展会`
                  : `Showing ${startIndex + 1}–${Math.min(startIndex + pageSize, displayedEvents.length)} of ${displayedEvents.length} events`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Page Size Selector */}
              <div className="flex items-center gap-1.5 text-[#666666]">
                <span className="text-[11px] font-medium">{locale === "zh" ? "每页显示：" : "Per page:"}</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-[#D8D2C8] rounded-lg px-2.5 py-1 text-xs font-bold text-[#133020] focus:outline-none focus:border-[#046241] cursor-pointer shadow-2xs"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="p-1.5 rounded-lg border border-[#D8D2C8] bg-white text-[#133020] hover:bg-[#F0ECE1] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
                  title={locale === "zh" ? "首页" : "First Page"}
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg border border-[#D8D2C8] bg-white text-[#133020] hover:bg-[#F0ECE1] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
                  title={locale === "zh" ? "上一页" : "Previous Page"}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="px-2.5 py-1 font-bold text-xs text-[#133020]">
                  {locale === "zh" ? `第 ${currentPage} / ${totalPages} 页` : `Page ${currentPage} of ${totalPages}`}
                </span>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded-lg border border-[#D8D2C8] bg-white text-[#133020] hover:bg-[#F0ECE1] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
                  title={locale === "zh" ? "下一页" : "Next Page"}
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="p-1.5 rounded-lg border border-[#D8D2C8] bg-white text-[#133020] hover:bg-[#F0ECE1] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
                  title={locale === "zh" ? "末页" : "Last Page"}
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

