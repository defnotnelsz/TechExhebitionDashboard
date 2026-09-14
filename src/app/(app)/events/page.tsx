"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EventCard } from "@/components/events/event-card";
import { EventTable } from "@/components/events/event-table";
import { EventFilters } from "@/components/events/event-filters";
import { EventForm } from "@/components/events/event-form";
import { ModalPortal } from "@/components/shared/modal-portal";
import { DeleteEventModal } from "@/components/events/delete-event-modal";
import { Skeleton } from "@/components/shared/skeleton";
import { LayoutGrid, Table as TableIcon, Plus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useLocaleStore } from "@/stores/locale-store";

export default function EventsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"table" | "card">("card");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [deletingEvent, setDeletingEvent] = useState<{ id: number; eventName: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { locale } = useLocaleStore();

  const handleToggleAttended = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAttended: !currentStatus }),
      });
      if (res.ok) {
        if (!currentStatus) {
          toast.success(
            locale === "zh"
              ? "已成功标记为已参展，正跳转至参展历史档案库！"
              : "Event marked as Attended! Redirecting to Attendance History..."
          );
          router.push("/history?tab=ATTENDED");
          router.refresh();
        } else {
          toast.success(
            locale === "zh" ? "已更新参展状态" : "Attendance status updated"
          );
          fetchEvents();
        }
      }
    } catch {
      toast.error(locale === "zh" ? "更新参展状态失败" : "Error updating attendance");
    }
  };

  const [filters, setFilters] = useState({
    region: "ALL",
    businessLine: "ALL",
    fitScore: "ALL",
    priority: "ALL",
    search: "",
    sortBy: "NUMBER_ASC",
    startDate: "",
    endDate: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    totalCount: 0,
    totalPages: 1,
  });

  const handleViewModeToggle = (mode: "card" | "table") => {
    setViewMode(mode);
    setPagination((prev) => ({
      ...prev,
      page: 1,
      limit: mode === "card" ? 9 : 10,
    }));
  };

  const [pageInput, setPageInput] = useState<string>("1");

  useEffect(() => {
    setPageInput(pagination.page.toString());
  }, [pagination.page]);

  const handlePageInputSubmit = () => {
    const p = parseInt(pageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: p }));
    } else {
      setPageInput(pagination.page.toString());
    }
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        region: filters.region,
        businessLine: filters.businessLine,
        fitScore: filters.fitScore,
        priority: filters.priority,
        search: filters.search,
        sortBy: filters.sortBy,
      });

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setEvents(data.events || []);
        if (data.pagination) {
          setPagination((prev) => ({
            ...prev,
            totalCount: data.pagination.totalCount,
            totalPages: data.pagination.totalPages,
          }));
        }
      } else {
        toast.error(
          locale === "zh"
            ? `加载展会列表失败: ${data.error}`
            : `Failed to load events: ${data.error}`
        );
      }
    } catch {
      toast.error(locale === "zh" ? "加载展会列表异常" : "Error loading events");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, locale]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      region: "ALL",
      businessLine: "ALL",
      fitScore: "ALL",
      priority: "ALL",
      search: "",
      sortBy: "NUMBER_ASC",
      startDate: "",
      endDate: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDeleteClick = (id: number) => {
    const target = events.find((e) => e.id === id);
    setDeletingEvent({
      id,
      eventName: target?.eventName || `#${target?.eventNumber || id}`,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deletingEvent) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/events/${deletingEvent.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(
          locale === "zh" ? "展会记录已成功删除" : "Event deleted successfully"
        );
        setDeletingEvent(null);
        fetchEvents();
      } else {
        const data = await res.json();
        toast.error(
          data.error ||
            (locale === "zh" ? "删除展会记录失败" : "Failed to delete event")
        );
      }
    } catch {
      toast.error(locale === "zh" ? "删除展会记录异常" : "Error deleting event");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen -m-8 p-8 font-manrope bg-[#F5EEDB] dark:bg-[#133020] text-[#133020] dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6 w-full">
        {/* Top Section */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#D8D2C8] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#133020] dark:text-white tracking-tight leading-tight">
            {locale === "en" ? "Exhibition records" : "展会记录库"}
            </h2>
          <p className="text-xs text-black dark:text-white/60 mt-0.5">
            {locale === "en"
              ? `Showing ${pagination.totalCount} strategic tech exhibition records`
              : `显示 ${pagination.totalCount} 条战略科技展会记录`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-white border-[1.5px] border-[#D8D2C8] rounded-[8px] shadow-2xs">
            <button
              onClick={() => handleViewModeToggle("card")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition cursor-pointer ${
                viewMode === "card"
                  ? "bg-[#133020] text-white shadow-2xs"
                  : "text-[#666666] hover:text-[#133020]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{locale === "en" ? "Cards" : "卡片视图"}</span>
            </button>
            <button
              onClick={() => handleViewModeToggle("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#133020] text-white shadow-2xs"
                  : "text-[#666666] hover:text-[#133020]"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{locale === "en" ? "Table" : "表格视图"}</span>
            </button>
          </div>

                </div>
      </div>

      {/* Filter Bar (includes Add Event beside search) */}
      <EventFilters
        filters={filters}
        viewMode={viewMode}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        onAddEvent={() => setShowAddModal(true)}
      />
      
      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-[12px]" />
          ))}
        </div>
      ) : events.length === 0 ? (
        /* Empty State */
        <div className="bg-white border-[1.5px] border-dashed border-[#D8D2C8] rounded-[12px] p-12 text-center max-w-lg mx-auto my-8 font-manrope">
          <div className="w-14 h-14 bg-[#F5EEDB] rounded-[10px] flex items-center justify-center mx-auto mb-4 text-[#046241]">
            <LayoutGrid className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-[#133020] mb-1">
            {locale === "zh" ? "未找到相关展会记录" : "No exhibition events found"}
          </h3>
          <p className="text-xs text-[#666666] mb-6">
            {locale === "zh"
              ? "请尝试调整筛选条件或搜索关键词，或录入新展会。"
              : "Try adjusting your filter preferences or search term, or add a new event."}
          </p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-[#133020] text-white text-xs font-medium rounded-[8px] hover:bg-[#046241] transition"
          >
            {locale === "zh" ? "重置筛选" : "Clear all filters"}
          </button>
        </div>
      ) : (
        /* Events Data List */
        <div>
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((evt) => (
                <EventCard key={evt.id} event={evt} onToggleAttended={handleToggleAttended} />
              ))}
            </div>
          ) : (
            <EventTable events={events} onDelete={handleDeleteClick} onEdit={(evt: any) => setEditingEvent(evt)} />
          )}

          {/* Interactive Pagination Controls with Centered Navigation */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4 text-xs font-manrope bg-transparent p-2 border-none shadow-none">
              {/* Centered Prev / Input Page / Next Block */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="px-3.5 py-1.5 rounded-lg border border-[#D8D2C8] dark:border-[#235338] bg-[#F9F7F7] dark:bg-[#1A3D2A] text-[#133020] dark:text-white font-bold text-xs disabled:opacity-40 hover:bg-[#046241] hover:text-white transition cursor-pointer"
                >
                  {locale === "zh" ? "上一页" : "Prev"}
                </button>

                <div className="flex items-center gap-1.5 text-xs text-[#133020] dark:text-slate-200">
                  <span>{locale === "zh" ? "第" : "Page"}</span>
                  <input
                    type="number"
                    min={1}
                    max={pagination.totalPages}
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handlePageInputSubmit();
                    }}
                    onBlur={handlePageInputSubmit}
                    className="w-12 py-1 text-center font-bold text-xs bg-white dark:bg-[#1A3D2A] border border-[#D8D2C8] dark:border-[#235338] rounded-md text-[#133020] dark:text-white focus:outline-none focus:border-[#046241] focus:ring-1 focus:ring-[#046241] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    title={locale === "zh" ? "输入页码按 Enter 跳转" : "Type page number and press Enter"}
                  />
                  <span>{locale === "zh" ? `页 / 共 ${pagination.totalPages} 页` : `of ${pagination.totalPages}`}</span>
                </div>

                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  className="px-3.5 py-1.5 rounded-lg border border-[#D8D2C8] dark:border-[#235338] bg-[#F9F7F7] dark:bg-[#1A3D2A] text-[#133020] dark:text-white font-bold text-xs disabled:opacity-40 hover:bg-[#046241] hover:text-white transition cursor-pointer"
                >
                  {locale === "zh" ? "下一页" : "Next"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Edit Event Pop-up Modal */}
      <ModalPortal isOpen={!!editingEvent} onClose={() => setEditingEvent(null)}>
        <div className="bg-[#133020] text-white p-5 px-7 flex items-center justify-between shrink-0 shadow-sm border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFB347] text-[#133020] flex items-center justify-center font-bold shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {locale === "en" ? "Edit Exhibition Record" : "编辑展会记录"}
              </h3>
              <p className="text-[10px] text-[#F5EEDB]/70 uppercase tracking-wider">
                Record #{editingEvent?.eventNumber} · {editingEvent?.eventName}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditingEvent(null)}
            className="p-2 rounded-xl bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transform hover:rotate-90 transition duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 bg-white max-h-[80vh] overflow-y-auto no-scrollbar">
          {editingEvent && (
            <EventForm
              initialData={editingEvent}
              isEditing
              onSuccess={() => {
                setEditingEvent(null);
                fetchEvents();
              }}
            />
          )}
        </div>
      </ModalPortal>

      {/* Add Event Pop-up Modal */}
      <ModalPortal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="bg-[#133020] text-white p-5 px-7 flex items-center justify-between shrink-0 shadow-sm border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFB347] text-[#133020] flex items-center justify-center font-bold shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {locale === "en" ? "Add New Exhibition Record" : "录入新展会记录"}
              </h3>
              <p className="text-[10px] text-[#F5EEDB]/70 uppercase tracking-wider">
                Lifewood Intelligence Database
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(false)}
            className="p-2 rounded-xl bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transform hover:rotate-90 transition duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto no-scrollbar">
          <EventForm
            onSuccess={() => {
              setShowAddModal(false);
              fetchEvents();
            }}
            onCancel={() => setShowAddModal(false)}
          />
        </div>
      </ModalPortal>

      {/* Delete Event Modal */}
      <DeleteEventModal
        isOpen={!!deletingEvent}
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleConfirmDelete}
        eventName={deletingEvent?.eventName}
        isDeleting={isDeleting}
      />
      </div>
    </div>
  );
}
