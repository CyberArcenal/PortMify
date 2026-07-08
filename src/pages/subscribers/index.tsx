// src/pages/subscribers/index.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { RefreshCw, Eye, EyeOff, Filter, Mail } from "lucide-react";
import Button from "../../components/UI/Button";
import { dialogs } from "../../utils/dialogs";
import { showSuccess, showError } from "../../utils/notification";
import { usePagination } from "../../contexts/PaginationContext";

import useSubscribers, { type SubscriberWithDetails } from "./hooks/useSubscribers";
import { useSubscriberView } from "./hooks/useSubscriberView";
import SubscriberTable from "./components/SubscriberTable";
import SubscriberViewDialog from "./components/SubscriberViewDialog";
import FilterBar from "./components/FilterBar";
import SummaryCards from "../../components/UI/SummaryCards";
import BulkActionsBar from "../../components/UI/BulkActionsBar";
import subscriberAPI from "@/api/core/subscriber";

import { Mail as MailIcon, Users, CheckCircle, XCircle } from "lucide-react";

const SubscribersPage: React.FC = () => {
  const {
    subscribers,
    filters,
    loading,
    error,
    pagination,
    selectedSubscribers,
    setSelectedSubscribers,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleSubscriberSelection,
    toggleSelectAll,
    handleSort,
    totalCount,
  } = useSubscribers();

  const viewDialog = useSubscriberView();

  const [showStats, setShowStats] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const { setPagination, clearPagination } = usePagination();

  // ─── Pagination Integration ──────────────────────────────────────
  const handlePageChange = useCallback(
    (newPage: number) => setCurrentPage(newPage),
    [setCurrentPage]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setPageSize(newSize);
      setCurrentPage(1);
    },
    [setPageSize, setCurrentPage]
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

  const prevPageRef = useRef(currentPage);
  const prevTotalRef = useRef(totalCount);
  const prevLimitRef = useRef(pageSize);

  useEffect(() => {
    const pageChanged = prevPageRef.current !== currentPage;
    const totalChanged = prevTotalRef.current !== totalCount;
    const limitChanged = prevLimitRef.current !== pageSize;

    if (pageChanged || totalChanged || limitChanged) {
      prevPageRef.current = currentPage;
      prevTotalRef.current = totalCount;
      prevLimitRef.current = pageSize;

      setPagination({
        currentPage,
        totalItems: totalCount,
        pageSize,
        onPageChange: handlersRef.current.onPageChange,
        onPageSizeChange: handlersRef.current.onPageSizeChange,
        pageSizeOptions: [10, 25, 50, 100],
        showPageSize: true,
      });
    }
  }, [currentPage, totalCount, pageSize, setPagination]);

  useEffect(() => {
    return () => clearPagination();
  }, [clearPagination]);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleToggleActive = async (subscriber: SubscriberWithDetails) => {
    try {
      await subscriberAPI.patch(subscriber.id, { is_active: !subscriber.is_active });
      showSuccess(
        subscriber.is_active ? "Subscriber deactivated" : "Subscriber activated"
      );
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleToggleConfirmed = async (subscriber: SubscriberWithDetails) => {
    try {
      await subscriberAPI.patch(subscriber.id, { confirmed: !subscriber.confirmed });
      showSuccess(
        subscriber.confirmed ? "Marked as unconfirmed" : "Marked as confirmed"
      );
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleDelete = async (subscriber: SubscriberWithDetails) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Subscriber",
      message: `Are you sure you want to delete ${subscriber.email}?`,
    });
    if (!confirmed) return;
    try {
      await subscriberAPI.delete(subscriber.id);
      showSuccess("Subscriber deleted successfully.");
      reload();
    } catch (err: any) {
      dialogs.alert({ title: "Error", message: err.message });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSubscribers.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Delete ${selectedSubscribers.length} subscriber${selectedSubscribers.length > 1 ? "s" : ""}?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(selectedSubscribers.map((id) => subscriberAPI.delete(id)));
      showSuccess(`${selectedSubscribers.length} subscriber${selectedSubscribers.length > 1 ? "s" : ""} deleted.`);
      setSelectedSubscribers([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // ─── Summary Cards ──────────────────────────────────────────────
  const activeCount = subscribers?.filter((s) => s.is_active).length || 0;
  const inactiveCount = subscribers?.filter((s) => !s.is_active).length || 0;
  const confirmedCount = subscribers?.filter((s) => s.confirmed).length || 0;
  const unconfirmedCount = subscribers?.filter((s) => !s.confirmed).length || 0;

  const summaryCards = [
    {
      title: "Total Subscribers",
      value: pagination.count,
      icon: MailIcon,
      color: "blue",
    },
    {
      title: "Active",
      value: activeCount,
      icon: Users,
      color: "green",
    },
    {
      title: "Inactive",
      value: inactiveCount,
      icon: XCircle,
      color: "red",
    },
    {
      title: "Confirmed",
      value: confirmedCount,
      icon: CheckCircle,
      color: "purple",
    },
  ];

  const hasFilters = Object.values(filters).some((v) => v);

  return (
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--sidebar-text)]">
            Subscribers
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage newsletter subscribers
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
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors"
            title={showFilters ? "Hide filters" : "Show filters"}
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={reload}
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

      {/* ─── Filter Bar ─── */}
      {showFilters && (
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
        />
      )}

      {/* ─── Bulk Actions ─── */}
      {selectedSubscribers.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedSubscribers.length}
          onClearSelection={() => setSelectedSubscribers([])}
          onDelete={handleBulkDelete}
          loading={loading}
        />
      )}

      {/* ─── Table ─── */}
      {loading && subscribers.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-[var(--danger-color)]">
          Error: {error}
        </div>
      ) : (
        <SubscriberTable
          subscribers={subscribers}
          selectedSubscribers={selectedSubscribers}
          onToggleSelect={toggleSubscriberSelection}
          onToggleSelectAll={toggleSelectAll}
          onSort={handleSort}
          sortConfig={sortConfig}
          onView={(sub) => viewDialog.open(sub.id)}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          onToggleConfirmed={handleToggleConfirmed}
        />
      )}

      {/* ─── Empty State ─── */}
      {!loading && !error && subscribers.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)] opacity-50" />
          <p className="text-base font-medium text-[var(--sidebar-text)]">
            No subscribers found.
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {hasFilters
              ? "Try adjusting your filters"
              : "Subscribers will appear when people sign up"}
          </p>
          {hasFilters && (
            <div className="mt-4">
              <button
                className="px-4 py-2 rounded-lg text-sm bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors"
                onClick={resetFilters}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Dialogs ─── */}
      <SubscriberViewDialog
        isOpen={viewDialog.isOpen}
        subscriber={viewDialog.subscriber}
        loading={viewDialog.loading}
        onClose={viewDialog.close}
      />
    </div>
  );
};

export default SubscribersPage;