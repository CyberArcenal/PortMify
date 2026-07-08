// src/pages/notifyLog/index.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { RefreshCw, Eye, EyeOff, Filter, Mail, AlertCircle, CheckCircle, Clock } from "lucide-react";
import Button from "../../components/UI/Button";
import { dialogs } from "../../utils/dialogs";
import { showSuccess, showError } from "../../utils/notification";
import { usePagination } from "../../contexts/PaginationContext";

import { useNotificationLogs } from "./hooks/useNotifyLogs";
import { NotificationSearch } from "./components/NotifySearch";
import { NotificationFilterPanel } from "./components/NotifyFilterPanel";
import { NotificationTable } from "./components/NotifyTable";
import { NotificationViewDialog } from "./Dialogs/NotifyViewDialog";
import SummaryCards from "../../components/UI/SummaryCards";
import notifyLogAPI, { NotifyLog } from "../../api/core/notifyLog";

const NotifyLogPage: React.FC = () => {
  const {
    logs,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    setPage,
    setPageSize,
    refetch,
  } = useNotificationLogs();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<NotifyLog | null>(null);
  const [sendingRows, setSendingRows] = useState<Set<number>>(new Set());
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { setPagination, clearPagination } = usePagination();

  // ─── Pagination Integration ──────────────────────────────────────
  const handlePageChange = useCallback(
    (newPage: number) => setPage(newPage),
    [setPage]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setPageSize(newSize);
      setPage(1);
    },
    [setPageSize, setPage]
  );

  const handlersRef = useRef({
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
  });

  useEffect(() => {
    handlersRef.current = {
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    };
  }, [handlePageChange, handlePageSizeChange]);

  const prevPageRef = useRef(pagination.page);
  const prevTotalRef = useRef(pagination.total);
  const prevLimitRef = useRef(pagination.limit);

  useEffect(() => {
    const pageChanged = prevPageRef.current !== pagination.page;
    const totalChanged = prevTotalRef.current !== pagination.total;
    const limitChanged = prevLimitRef.current !== pagination.limit;

    if (pageChanged || totalChanged || limitChanged) {
      prevPageRef.current = pagination.page;
      prevTotalRef.current = pagination.total;
      prevLimitRef.current = pagination.limit;

      setPagination({
        currentPage: pagination.page,
        totalItems: pagination.total,
        pageSize: pagination.limit,
        onPageChange: handlersRef.current.onPageChange,
        onPageSizeChange: handlersRef.current.onPageSizeChange,
        pageSizeOptions: [10, 25, 50, 100],
        showPageSize: true,
      });
    }
  }, [pagination.page, pagination.total, pagination.limit, setPagination]);

  useEffect(() => {
    return () => clearPagination();
  }, [clearPagination]);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateFilters({ keyword: query });
  };

  const handleFilterChange = (newFilters: any) => {
    updateFilters(newFilters);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    clearFilters();
  };

  const handleView = (log: NotifyLog) => {
    setSelectedLog(log);
    setIsViewDialogOpen(true);
  };

  const handleRetry = async (id: number) => {
    setSendingRows((prev) => new Set(prev).add(id));
    try {
      await notifyLogAPI.retryFailed(id);
      showSuccess("The notification has been queued for retry.");
      refetch();
    } catch (err: any) {
      showError(err.message || "Unable to retry notification");
    } finally {
      setSendingRows((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const confirmRetry = (id: number) => {
    dialogs
      .confirm({
        title: "Retry Notification",
        message: "Are you sure you want to retry this failed notification?",
        confirmText: "Retry",
        cancelText: "Cancel",
      })
      .then((confirmed) => {
        if (confirmed) handleRetry(id);
      });
  };

  const handleResend = async (id: number) => {
    setSendingRows((prev) => new Set(prev).add(id));
    try {
      await notifyLogAPI.resend(id);
      showSuccess("The notification has been resent.");
      refetch();
    } catch (err: any) {
      showError(err.message || "Unable to resend notification");
    } finally {
      setSendingRows((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const confirmResend = (id: number) => {
    dialogs
      .confirm({
        title: "Resend Notification",
        message: "Are you sure you want to resend this notification?",
        confirmText: "Resend",
        cancelText: "Cancel",
      })
      .then((confirmed) => {
        if (confirmed) handleResend(id);
      });
  };

  const handleDelete = async (id: number) => {
    try {
      await notifyLogAPI.delete(id);
      dialogs.success("Deleted", `Notification #${id} has been deleted.`);
      refetch();
    } catch (err: any) {
      dialogs.error("Delete failed", err.message);
    }
  };

  const confirmDelete = (id: number) => {
    dialogs
      .confirm({
        title: "Delete Notification",
        message: `Are you sure you want to delete notification #${id}?`,
        confirmText: "Delete",
        cancelText: "Cancel",
      })
      .then((confirmed) => {
        if (confirmed) handleDelete(id);
      });
  };

  // ─── Summary Cards ──────────────────────────────────────────────
  const summaryCards = [
    {
      title: "Total Logs",
      value: pagination.total,
      icon: Mail,
      color: "blue",
    },
    {
      title: "Sent",
      value: logs?.filter((l) => l.status === "sent").length || 0,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Failed",
      value: logs?.filter((l) => l.status === "failed").length || 0,
      icon: AlertCircle,
      color: "red",
    },
    {
      title: "Queued",
      value: logs?.filter((l) => l.status === "queued").length || 0,
      icon: Clock,
      color: "yellow",
    },
  ];

  const hasFilters = filters.status || filters.startDate || filters.endDate || searchQuery;

  return (
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--sidebar-text)]">
            Notification Logs
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Track all sent notifications and their delivery status
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors"
            title={showStats ? "Hide summary" : "Show summary"}
          >
            {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors"
            title={isFilterOpen ? "Hide filters" : "Show filters"}
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─── Summary Cards ─── */}
      {showStats && <SummaryCards cards={summaryCards} columns={4} />}

      {/* ─── Search Bar ─── */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <NotificationSearch value={searchQuery} onChange={handleSearchChange} />
        {searchQuery && (
          <span className="text-sm text-[var(--text-secondary)]">
            Searching: "{searchQuery}"
          </span>
        )}
      </div>

      {/* ─── Filter Panel ─── */}
      {isFilterOpen && (
        <NotificationFilterPanel
          filters={{
            status: filters.status,
            startDate: filters.startDate,
            endDate: filters.endDate,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
          }}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          isOpen={isFilterOpen}
          onToggle={() => setIsFilterOpen(!isFilterOpen)}
        />
      )}

      {/* ─── Error Display ─── */}
      {error && (
        <div className="bg-[var(--danger-color)]/10 border border-[var(--danger-color)]/30 rounded-lg p-4 text-[var(--danger-color)]">
          {error}
          <button onClick={refetch} className="ml-3 underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* ─── Table ─── */}
      <NotificationTable
        logs={logs}
        onView={handleView}
        onRetry={confirmRetry}
        onResend={confirmResend}
        onDelete={confirmDelete}
        isLoading={loading}
        sendingIds={sendingRows}
      />

      {/* ─── View Dialog ─── */}
      {selectedLog && (
        <NotificationViewDialog
          log={selectedLog}
          isOpen={isViewDialogOpen}
          onClose={() => {
            setIsViewDialogOpen(false);
            setSelectedLog(null);
          }}
        />
      )}
    </div>
  );
};

export default NotifyLogPage;