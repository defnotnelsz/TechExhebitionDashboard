"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FitScoreBadge } from "@/components/events/fit-score-badge";
import { PriorityIndicator } from "@/components/events/priority-indicator";
import { BusinessLineChip } from "@/components/events/business-line-chip";
import { ModalPortal } from "@/components/shared/modal-portal";
import { BUSINESS_LINES } from "@/lib/constants/business-lines";
import {
  ListTodo,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Eye,
  Sparkles,
  X,
  Loader2,
  MapPin,
  Calendar,
  Building,
  User,
  ExternalLink,
  Tag,
  FileText,
  DollarSign,
  Mail,
  Award,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useLocaleStore } from "@/stores/locale-store";
import { sanitizeEventUrl } from "@/lib/url";
import { localizeEvent } from "@/lib/i18n/event-localization";

export default function QueuesPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "USER";
  const { locale } = useLocaleStore();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [inspectItem, setInspectItem] = useState<any | null>(null);
  const [reasonModal, setReasonModal] = useState<{ id: number; action: "REJECT"; reason: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [filterType, setFilterType] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"FOR_REVIEW" | "CORRECTION">("FOR_REVIEW");

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/queues");
      const data = await res.json();
      if (res.ok) {
        setItems(data.queueItems || []);
      } else {
        toast.error(data.error || (locale === "zh" ? "获取审核队列失败" : "Failed to fetch queue items"));
      }
    } catch {
      toast.error(locale === "zh" ? "加载审核队列出错" : "Error loading queue items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (id: number, action: "APPROVE" | "REJECT", reason?: string) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/queues/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          locale === "zh"
            ? `记录已${action === "APPROVE" ? "批准发布" : "驳回"}`
            : `Record ${action === "APPROVE" ? "Approved & Published" : "Rejected"}`
        );
        if (inspectItem?.id === id) {
          setInspectItem(null);
        }
        fetchQueue();
      } else {
        toast.error(data.error || (locale === "zh" ? "队列更新失败" : "Failed to update queue"));
      }
    } catch {
      toast.error(locale === "zh" ? "处理队列操作出错" : "Error updating queue record");
    } finally {
      setBusy(null);
    }
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === "FOR_REVIEW" && item.type !== "FOR_REVIEW") return false;
    if (activeTab === "CORRECTION" && item.type !== "CORRECTION") return false;
    if (filterType !== "ALL" && item.status !== filterType) return false;
    return true;
  });

  // Specs helper for modal
  const inspectEventData = inspectItem ? localizeEvent(inspectItem.event, locale) : null;

  let inspectBusinessLines: string[] = [];
  if (inspectEventData?.businessLines) {
    try {
      inspectBusinessLines = JSON.parse(inspectEventData.businessLines);
    } catch {
      inspectBusinessLines = Array.isArray(inspectEventData.businessLines)
        ? inspectEventData.businessLines
        : [inspectEventData.businessLines];
    }
  }

  let inspectSourceLinks: string[] = [];
  if (inspectEventData?.sourceLinks) {
    try {
      inspectSourceLinks = JSON.parse(inspectEventData.sourceLinks);
    } catch {
      inspectSourceLinks = Array.isArray(inspectEventData.sourceLinks)
        ? inspectEventData.sourceLinks
        : [inspectEventData.sourceLinks];
    }
  }

  return (
    <div className="space-y-6 font-manrope">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D8D2C8] dark:border-[#1E4830] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#046241]/10 dark:bg-[#046241]/25 border border-[#046241]/30 flex items-center justify-center text-[#046241] dark:text-[#52B788]">
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#133020] dark:text-white">
                {locale === "en" ? "Review & Governance Queues" : "展会审核与战略治理队列"}
              </h2>
              <p className="text-xs text-[#666666] dark:text-white/60 mt-0.5">
                {locale === "zh"
                  ? "评估新抓取展会、核实实习专员录入项，并裁定战略适配度评级 (1-5)"
                  : "Evaluate newly scraped exhibitions, verify user draft entries, and adjudicate strategic fit ratings"}
              </p>
            </div>
          </div>
        </div>

        {userRole === "USER" && (
          <div className="px-3.5 py-2 bg-[#FFB347]/20 border border-[#FFB347] text-[#133020] dark:text-white text-xs font-bold rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C17110] dark:text-[#FFB347]" />
            <span>{locale === "zh" ? "手动提交待管理员审核" : "Manual Submissions Awaiting Admin Review"}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#133020] dark:text-white">
            {locale === "zh" ? "待审核提交队列卡片" : "Pending Submission Cards"}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#046241] text-white text-xs font-bold">
            {filteredItems.length}
          </span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-[#046241]">
          <Loader2 className="w-9 h-9 animate-spin mb-3 text-[#046241]" />
          <span className="text-sm font-semibold text-[#133020] dark:text-white">
            {locale === "zh" ? "正在加载待处理队列卡片..." : "Loading pending queue cards..."}
          </span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-[#081C12] border border-[#D8D2C8] dark:border-white/15 rounded-3xl p-16 md:p-20 text-center max-w-2xl mx-auto my-12 font-manrope shadow-sm dark:shadow-floating-dark">
          <div className="w-20 h-20 rounded-2xl bg-[#046241]/10 dark:bg-[#046241]/25 border border-[#046241]/20 flex items-center justify-center text-[#046241] dark:text-[#52B788] mx-auto mb-6 shadow-inner">
            <CheckCircle className="w-10 h-10 stroke-[1.75]" />
          </div>
          <h3 className="text-2xl font-bold text-[#133020] dark:text-white mb-2">
            {locale === "zh" ? "队列已全部清空" : "Queue is clear"}
          </h3>
          <p className="text-sm text-[#666666] dark:text-white/70 max-w-md mx-auto leading-relaxed">
            {locale === "zh"
              ? "所有待处理的手动提交与改动均已完成审核评估并录入展会库。"
              : "All exhibition submissions have been evaluated, reviewed, and published. No pending items require your attention."}
          </p>
        </div>
      ) : (
        /* UNIFIED EVENT CARD GRID VIEW FOR QUEUE ITEMS */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredItems.map((item) => {
              const localizedEvt = localizeEvent(item.event, locale);

              let businessLines: string[] = [];
              try {
                businessLines = JSON.parse(localizedEvt?.businessLines || "[]");
              } catch {
                businessLines = Array.isArray(localizedEvt?.businessLines)
                  ? localizedEvt.businessLines
                  : [localizedEvt?.businessLines];
              }

              const primaryBL = businessLines[0] || "Global AI Data";
              const blConfig = BUSINESS_LINES.find(
                (b) =>
                  b.name.toLowerCase() === primaryBL.toLowerCase() ||
                  primaryBL.includes(b.name)
              );
              const accentColor = blConfig ? blConfig.colorHex : "#046241";

              const fitLevel =
                localizedEvt?.fitScore >= 4
                  ? locale === "zh" ? "高度契合" : "High"
                  : localizedEvt?.fitScore === 3
                  ? locale === "zh" ? "中度契合" : "Mid"
                  : locale === "zh" ? "基础契合" : "Low";

              const fitColor =
                localizedEvt?.fitScore >= 4
                  ? "text-[#046241]"
                  : localizedEvt?.fitScore === 3
                  ? "text-[#C17110]"
                  : "text-[#708E7C]";

              const submitterName = item.submittedBy?.name || (locale === "zh" ? "内部员工" : "Staff");
              const submitterRole =
                locale === "zh"
                  ? item.submittedBy?.role === "SUPERADMIN"
                    ? "超级管理员"
                    : item.submittedBy?.role === "ADMIN"
                    ? "管理员"
                    : "普通用户"
                  : item.submittedBy?.role || "USER";

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.98, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -12 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setInspectItem(item)}
                  className="bg-white dark:bg-[#081C12] rounded-[12px] border-[1.5px] border-[#D8D2C8] dark:border-white/10 shadow-[0_2px_16px_rgba(0,0,0,0.05)] dark:shadow-floating-dark hover:shadow-[0_6px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-floating-dark-lg hover:-translate-y-[1px] transition-all duration-180 overflow-hidden flex flex-col justify-between relative group font-manrope cursor-pointer"
                >
                  {/* 6px Color Accent Bar on Left Edge */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-[6px] z-10 rounded-l-[12px]"
                    style={{ backgroundColor: accentColor }}
                  />

                  {/* Top Submitter & Status Bar */}
                  <div className="p-4 pl-6 pb-0 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider bg-[#FFB347] text-[#133020]">
                        {locale === "zh" ? "待审核" : "PENDING"}
                      </span>
                      <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-semibold uppercase tracking-wider bg-[#046241]/10 text-[#046241] dark:text-[#52B788] border border-[#046241]/20">
                        {item.event?.source === "MANUAL"
                          ? locale === "zh" ? "手动录入" : "Manual Input"
                          : locale === "zh" ? "AI 抓取" : "AI Crawler"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-[#666666] dark:text-slate-300 font-medium shrink-0">
                      <User className="w-3.5 h-3.5 text-[#046241] dark:text-[#FFB347]" />
                      <span>{submitterName}</span>
                    </div>
                  </div>

                  {/* HEADER AREA */}
                  <div className="p-5 pl-6 pt-3 space-y-3">
                    {/* Event # · Date & Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[12px] text-[#666666] dark:text-slate-300">
                          <span className="font-semibold text-[#133020] dark:text-white">#{localizedEvt?.eventNumber}</span>
                          <span>·</span>
                          <span className="font-medium">{localizedEvt?.dates}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-[#666666] dark:text-slate-400">
                          <span>{localizedEvt?.region}</span>
                          {localizedEvt?.country && <span>· {localizedEvt.country}</span>}
                        </div>
                      </div>

                      <div className="flex items-center shrink-0">
                        <div
                          className="flex flex-col items-center justify-center min-w-[44px] px-2.5 py-1 rounded-[8px] bg-[#F9F7F7] dark:bg-[#1A3D2A] border border-[#D8D2C8] dark:border-[#235338]"
                          title={`Fit score: ${localizedEvt?.fitScore}/5`}
                        >
                          <span className="text-[26px] font-extrabold text-[#133020] dark:text-white leading-none">
                            {localizedEvt?.fitScore}
                          </span>
                          <span className={`text-[9.5px] font-bold uppercase tracking-wider mt-0.5 ${fitColor}`}>
                            {fitLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Event Name */}
                    <h3
                      onClick={() => setInspectItem(item)}
                      className="text-[18px] font-semibold text-[#133020] dark:text-white group-hover:text-[#046241] dark:group-hover:text-[#FFB347] transition leading-snug tracking-tight line-clamp-2 cursor-pointer"
                    >
                      {localizedEvt?.eventName}
                    </h3>

                    {/* Location & Venue */}
                    <div className="flex items-center gap-1.5 text-[12px] text-[#666666] dark:text-slate-300 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#046241] dark:text-[#FFB347] shrink-0" />
                      <span className="truncate">
                        {localizedEvt?.city}, {localizedEvt?.country}
                        {localizedEvt?.venue && (
                          <span className="text-[#133020] dark:text-white font-medium"> · {localizedEvt.venue}</span>
                        )}
                      </span>
                    </div>

                    {/* Business Line Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {businessLines.map((bl) => (
                        <BusinessLineChip key={bl} name={bl} />
                      ))}
                    </div>
                  </div>

                  {/* BODY GRID (3 columns like EventCard) */}
                  <div className="border-t border-[#D8D2C8] dark:border-white/10 bg-white dark:bg-[#081C12] px-5 pl-6 py-3 grid grid-cols-3 gap-2.5 text-[12px]">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase tracking-wider text-[#666666] dark:text-white/70 font-medium block">
                        {locale === "zh" ? "主办机构" : "Organizer"}
                      </span>
                      <span className="text-[12px] font-medium text-[#133020] dark:text-white truncate block" title={localizedEvt?.organizer}>
                        {localizedEvt?.organizer || (locale === "zh" ? "未公开披露" : "Not disclosed")}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase tracking-wider text-[#666666] dark:text-white/70 font-medium block">
                        {locale === "zh" ? "目标受众" : "Audience"}
                      </span>
                      <span className="text-[12px] font-medium text-[#133020] dark:text-white truncate block" title={localizedEvt?.targetAudience}>
                        {localizedEvt?.targetAudience || (locale === "zh" ? "企业级采购决策者" : "Enterprise buyers")}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase tracking-wider text-[#666666] dark:text-white/70 font-medium block">
                        {locale === "zh" ? "参会人数" : "Attendees"}
                      </span>
                      <span className="text-[12px] font-medium text-[#133020] dark:text-white truncate block" title={localizedEvt?.estimatedAttendees}>
                        {localizedEvt?.estimatedAttendees || (locale === "zh" ? "未公开披露" : "Not disclosed")}
                      </span>
                    </div>
                  </div>

                  {/* SUBMITTER RATIONALE BOX */}
                  <div className="border-t border-[#D8D2C8] dark:border-white/10 bg-[#F0F5F2] dark:bg-[#046241]/15 px-5 pl-6 py-2.5 text-xs">
                    <span className="text-[10px] font-bold text-[#046241] dark:text-[#52B788] uppercase tracking-wider block mb-0.5">
                      {locale === "zh" ? "提交理由与说明" : "Submission Rationale"}
                    </span>
                    <p className="text-[12px] text-[#133020] dark:text-white line-clamp-2 leading-relaxed font-normal italic">
                      "{item.reason || (locale === "zh" ? "手动录入新展会档案待审核" : "Manually added exhibition record awaiting review")}"
                    </p>
                  </div>

                  {/* ACTION FOOTER */}
                  <div className="border-t border-[#D8D2C8] dark:border-white/10 bg-[#F9F7F7] dark:bg-[#081C12] px-5 pl-6 py-3 flex items-center justify-end gap-3 text-xs">
                    {(userRole === "SUPERADMIN" || userRole === "ADMIN") && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={busy === item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(item.id, "REJECT");
                          }}
                          className="px-2.5 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white rounded-[8px] text-[11px] font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{locale === "zh" ? "驳回" : "Reject"}</span>
                        </button>

                        <button
                          type="button"
                          disabled={busy === item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(item.id, "APPROVE");
                          }}
                          className="px-3.5 py-1.5 bg-[#046241] hover:bg-[#133020] text-white rounded-[8px] text-[11px] font-bold transition shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {busy === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5 text-[#FFB347]" />
                          )}
                          <span>{locale === "zh" ? "批准" : "Approve"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* FULL SPECIFICATION POP-UP MODAL */}
      <ModalPortal isOpen={!!inspectItem} onClose={() => setInspectItem(null)} maxWidthClass="max-w-3xl">
        {inspectItem && inspectEventData && (
          <div className="font-manrope text-xs space-y-0">
            {/* Modal Top Header */}
            <div className="bg-[#133020] text-white p-5 px-7 flex items-center justify-between shrink-0 shadow-sm border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFB347] text-[#133020] flex items-center justify-center font-extrabold shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {locale === "zh" ? "手动录入展会完整规格档案" : "Manually Input Exhibition Specifications"}
                  </h3>
                  <p className="text-[11px] text-[#F5EEDB]/70 uppercase tracking-wider">
                    Record #{inspectEventData.eventNumber} • {inspectEventData.eventName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="p-2 rounded-xl bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transform hover:rotate-90 transition duration-200 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content Body */}
            <div className="p-6 sm:p-8 bg-white dark:bg-[#081C12] text-[#133020] dark:text-white max-h-[78vh] overflow-y-auto space-y-6">
              {/* Top Summary Banner */}
              <div className="p-5 rounded-2xl bg-[#F9F7F7] dark:bg-white/5 border border-[#D8D2C8] dark:border-white/10 space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#046241] dark:text-[#FFB347] uppercase tracking-wider block">
                      {inspectEventData.region} • {inspectEventData.country}
                    </span>
                    <h4 className="text-xl font-bold text-[#133020] dark:text-white leading-snug">
                      {inspectEventData.eventName}
                    </h4>
                    <p className="text-xs text-[#666666] dark:text-slate-300 flex items-center gap-1.5 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#046241] dark:text-[#FFB347]" />
                      <span>{inspectEventData.city}, {inspectEventData.country}</span>
                      {inspectEventData.venue && <span className="font-semibold">· {inspectEventData.venue}</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <FitScoreBadge score={inspectEventData.fitScore} size="xl" showLevel />
                    {inspectEventData.priorityLevel && (
                      <PriorityIndicator priority={inspectEventData.priorityLevel} />
                    )}
                  </div>
                </div>

                {/* Submitter Rationale Meta Box */}
                <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
                  <User className="w-4 h-4 text-[#C17110] dark:text-[#FFB347] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#133020] dark:text-white block">
                      {locale === "zh" ? "提交者声明与更正原因：" : "Submitter Statement & Rationale:"}
                    </span>
                    <p className="text-[#666666] dark:text-slate-300 leading-relaxed mt-0.5 italic">
                      "{inspectItem.reason || (locale === "zh" ? "手动录入新展会档案待审核" : "Manually added exhibition record awaiting review")}"
                    </p>
                    <span className="text-[10px] text-[#666666] dark:text-slate-400 block mt-1">
                      {locale === "zh" ? "提交人：" : "Submitted by: "}{inspectItem.submittedBy?.name || "Staff"} ({inspectItem.submittedBy?.role}) · {new Date(inspectItem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* GROUP A: Identity & Location */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#D8D2C8] dark:border-[#1E4830] pb-2">
                  <span className="w-5 h-5 rounded-full bg-[#133020] dark:bg-[#FFB347] text-white dark:text-[#133020] text-[10px] font-bold flex items-center justify-center">
                    A
                  </span>
                  <h5 className="font-bold text-sm text-[#133020] dark:text-white">
                    {locale === "zh" ? "组 A — 基本信息与举办地点" : "Group A — Identity & Location"}
                  </h5>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F9F7F7] dark:bg-[#1A3D2A] p-4 rounded-xl border border-[#D8D2C8] dark:border-[#235338]">
                  <div>
                    <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block">
                      {locale === "zh" ? "所在大区" : "Region"}
                    </span>
                    <span className="font-semibold text-[#133020] dark:text-white">{inspectEventData.region}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block">
                      {locale === "zh" ? "举办国家/城市" : "Country / City"}
                    </span>
                    <span className="font-semibold text-[#133020] dark:text-white">{inspectEventData.city}, {inspectEventData.country}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block">
                      {locale === "zh" ? "展期字符串" : "Formatted Dates"}
                    </span>
                    <span className="font-semibold text-[#133020] dark:text-white">{inspectEventData.dates}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block">
                      {locale === "zh" ? "展馆场地" : "Venue"}
                    </span>
                    <span className="font-semibold text-[#133020] dark:text-white">{inspectEventData.venue || (locale === "zh" ? "未公开披露" : "Not disclosed")}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block">
                      {locale === "zh" ? "详细导航地址" : "Location Address"}
                    </span>
                    <span className="font-semibold text-[#133020] dark:text-white">{inspectEventData.locationAddress || (locale === "zh" ? "未填写" : "N/A")}</span>
                  </div>
                </div>
              </div>

              {/* GROUP B: Source & Organizer */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#D8D2C8] dark:border-[#1E4830] pb-2">
                  <span className="w-5 h-5 rounded-full bg-[#133020] dark:bg-[#FFB347] text-white dark:text-[#133020] text-[10px] font-bold flex items-center justify-center">
                    B
                  </span>
                  <h5 className="font-bold text-sm text-[#133020] dark:text-white">
                    {locale === "zh" ? "组 B — 信息来源与主办方" : "Group B — Source & Organizer"}
                  </h5>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#F9F7F7] dark:bg-[#1A3D2A] p-4 rounded-xl border border-[#D8D2C8] dark:border-[#235338]">
                  <div>
                    <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block">
                      {locale === "zh" ? "主办机构" : "Organizer"}
                    </span>
                    <span className="font-semibold text-[#133020] dark:text-white">{inspectEventData.organizer || (locale === "zh" ? "未公开披露" : "Not disclosed")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block">
                      {locale === "zh" ? "展会类别" : "Event Category"}
                    </span>
                    <span className="font-semibold text-[#133020] dark:text-white">{inspectEventData.eventCategory || (locale === "zh" ? "企业级科技展会" : "Enterprise Tech Exhibition")}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block mb-0.5">
                      {locale === "zh" ? "官方网站" : "Official Website"}
                    </span>
                    {inspectEventData.officialWebsite ? (
                      <a
                        href={inspectEventData.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-[#046241] dark:text-[#FFB347] hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px]">{inspectEventData.officialWebsite}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[#666666]">N/A</span>
                    )}
                  </div>
                </div>
              </div>

              {/* GROUP C: Strategic Assessment */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#D8D2C8] dark:border-[#1E4830] pb-2">
                  <span className="w-5 h-5 rounded-full bg-[#133020] dark:bg-[#FFB347] text-white dark:text-[#133020] text-[10px] font-bold flex items-center justify-center">
                    C
                  </span>
                  <h5 className="font-bold text-sm text-[#133020] dark:text-white">
                    {locale === "zh" ? "组 C — 战略契合度评估与评分" : "Group C — Strategic Assessment & Scoring"}
                  </h5>
                </div>

                <div className="space-y-3 bg-[#F9F7F7] dark:bg-[#1A3D2A] p-4 rounded-xl border border-[#D8D2C8] dark:border-[#235338]">
                  <div>
                    <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block mb-1">
                      {locale === "zh" ? "Lifewood 对应业务线" : "Lifewood Business Line(s)"}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {inspectBusinessLines.map((bl) => (
                        <BusinessLineChip key={bl} name={bl} />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#D8D2C8]/60 dark:border-[#235338]">
                    <div>
                      <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block mb-0.5">
                        {locale === "zh" ? "战略侧重点与定位" : "Strategic Focus"}
                      </span>
                      <p className="text-xs text-[#133020] dark:text-slate-200 leading-relaxed font-medium">
                        {inspectEventData.strategicFocus || (locale === "zh" ? "聚焦人工智能与企业数据服务" : "Focusing on AI and enterprise data services")}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#046241] dark:text-[#FFB347] font-bold uppercase block mb-0.5">
                        {locale === "zh" ? "与 Lifewood 的战略相关性" : "Relevance to Lifewood"}
                      </span>
                      <p className="text-xs text-[#133020] dark:text-slate-200 leading-relaxed font-medium">
                        {inspectEventData.relevanceToLifewood || (locale === "zh" ? "契合买家采购需求" : "Strategic buyer alignment")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-[#D8D2C8]/60 dark:border-[#235338]">
                    <div>
                      <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block">
                        {locale === "zh" ? "目标受众" : "Target Audience"}
                      </span>
                      <span className="font-semibold text-[#133020] dark:text-white">{inspectEventData.targetAudience || (locale === "zh" ? "企业级买家" : "Enterprise buyers")}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block">
                        {locale === "zh" ? "参会/参展建议" : "Recommendation"}
                      </span>
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FFB347] text-[#133020] font-bold text-[11px]">
                        {inspectEventData.participationRec || "Exhibit"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block">
                        {locale === "zh" ? "契合度评分" : "Fit Score"}
                      </span>
                      <span className="font-extrabold text-[#046241] dark:text-[#FFB347] text-sm">
                        Fit {inspectEventData.fitScore} / 5
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* GROUP D: Commercial Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#D8D2C8] dark:border-[#1E4830] pb-2">
                  <span className="w-5 h-5 rounded-full bg-[#133020] dark:bg-[#FFB347] text-white dark:text-[#133020] text-[10px] font-bold flex items-center justify-center">
                    D
                  </span>
                  <h5 className="font-bold text-sm text-[#133020] dark:text-white">
                    {locale === "zh" ? "组 D — 商业运营与商务细节" : "Group D — Commercial Detail"}
                  </h5>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F9F7F7] dark:bg-[#1A3D2A] p-4 rounded-xl border border-[#D8D2C8] dark:border-[#235338]">
                  <div>
                    <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block">
                      {locale === "zh" ? "预计参会人数" : "Estimated Attendees"}
                    </span>
                    <span className="font-semibold text-[#133020] dark:text-white">{inspectEventData.estimatedAttendees}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block">
                      {locale === "zh" ? "展位/赞助费用" : "Booth Cost"}
                    </span>
                    <span className="font-semibold text-[#133020] dark:text-white">{inspectEventData.boothCost}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block">
                      {locale === "zh" ? "报名截止日期" : "Registration Deadline"}
                    </span>
                    <span className="font-semibold text-[#133020] dark:text-white">{inspectEventData.registrationDeadline}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block">
                      {locale === "zh" ? "联系电子邮箱" : "Contact Email"}
                    </span>
                    <span className="font-semibold text-[#133020] dark:text-white">{inspectEventData.contactEmail}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block">
                      {locale === "zh" ? "联系人及职位" : "Contact Person"}
                    </span>
                    <span className="font-semibold text-[#133020] dark:text-white">{inspectEventData.contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block">
                      {locale === "zh" ? "社交媒体链接" : "Social Media"}
                    </span>
                    <span className="font-semibold text-[#133020] dark:text-white truncate block">{inspectEventData.socialMedia}</span>
                  </div>
                </div>
              </div>

              {/* GROUP E: Provenance & Source Links */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#D8D2C8] dark:border-[#1E4830] pb-2">
                  <span className="w-5 h-5 rounded-full bg-[#133020] dark:bg-[#FFB347] text-white dark:text-[#133020] text-[10px] font-bold flex items-center justify-center">
                    E
                  </span>
                  <h5 className="font-bold text-sm text-[#133020] dark:text-white">
                    {locale === "zh" ? "组 E — 信息溯源与佐证链接" : "Group E — Provenance & Source Links"}
                  </h5>
                </div>

                <div className="space-y-3 bg-[#F9F7F7] dark:bg-[#1A3D2A] p-4 rounded-xl border border-[#D8D2C8] dark:border-[#235338]">
                  {inspectEventData.keyNotes && (
                    <div>
                      <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block mb-0.5">
                        {locale === "zh" ? "关键备注" : "Key Notes"}
                      </span>
                      <p className="text-xs text-[#133020] dark:text-slate-200 leading-relaxed font-medium">
                        {inspectEventData.keyNotes}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] text-[#666666] dark:text-slate-400 font-bold uppercase block mb-1">
                      {locale === "zh" ? "核实佐证链接" : "Verification Source Links"}
                    </span>
                    <div className="space-y-1">
                      {inspectSourceLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-[#046241] dark:text-[#FFB347] hover:underline font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{link}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Footer Actions */}
            <div className="p-5 px-7 bg-[#F9F7F7] dark:bg-[#081C12] border-t border-[#D8D2C8] dark:border-white/10 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setInspectItem(null)}
                className="px-5 py-2.5 bg-white dark:bg-[#081C12] border border-[#D8D2C8] dark:border-white/15 text-[#133020] dark:text-white rounded-xl text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
              >
                {locale === "zh" ? "关闭" : "Close"}
              </button>

              {(userRole === "SUPERADMIN" || userRole === "ADMIN") && inspectItem.status === "PENDING" && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={busy === inspectItem.id}
                    onClick={() => handleAction(inspectItem.id, "REJECT")}
                    className="px-4 py-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{locale === "zh" ? "驳回提交" : "Reject Submission"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={busy === inspectItem.id}
                    onClick={() => handleAction(inspectItem.id, "APPROVE")}
                    className="px-6 py-2.5 bg-[#046241] hover:bg-[#133020] text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {busy === inspectItem.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-[#FFB347]" />
                    )}
                    <span>{locale === "zh" ? "批准并发布至展会库" : "Approve & Publish"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </ModalPortal>
    </div>
  );
}
