// src/pages/contact-messages/index.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { RefreshCw, Eye, EyeOff, Filter, Mail, CheckCircle, XCircle } from "lucide-react";
import Button from "../../components/UI/Button";
import { dialogs } from "../../utils/dialogs";
import { showSuccess, showError } from "../../utils/notification";
import { usePagination } from "../../contexts/PaginationContext";

import useContactMessages, { type ContactMessageWithDetails } from "./hooks/useContactMessages";
import { useContactMessageView } from "./hooks/useContactMessageView";
import ContactMessageTable from "./components/ContactMessageTable";
import ContactMessageViewDialog from "./components/ContactMessageViewDialog";
import FilterBar from "./components/FilterBar";
import SummaryCards from "../../components/UI/SummaryCards";
import BulkActionsBar from "../../components/UI/BulkActionsBar";
import contactMessageAPI from "@/api/core/contact_message";

import { Mail as MailIcon, CheckCircle as CheckIcon, Clock, Archive } from "lucide-react";

const ContactMessagesPage: React.FC = () => {
  const {
    messages,
    filters,
    loading,
    error,
    pagination,
    selectedMessages,
    setSelectedMessages,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleMessageSelection,
    toggleSelectAll,
    handleSort,
    totalCount,
  } = useContactMessages();

  const viewDialog = useContactMessageView();

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
  const handleToggleRead = async (message: ContactMessageWithDetails) => {
    try {
      await contactMessageAPI.patch(message.id, { is_read: !message.is_read });
      showSuccess(
        message.is_read ? "Message marked as unread" : "Message marked as read"
      );
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleDelete = async (message: ContactMessageWithDetails) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Message",
      message: `Are you sure you want to delete this message from "${message.name}"?`,
    });
    if (!confirmed) return;
    try {
      await contactMessageAPI.delete(message.id);
      showSuccess("Message deleted successfully.");
      reload();
    } catch (err: any) {
      dialogs.alert({ title: "Error", message: err.message });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMessages.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Delete ${selectedMessages.length} message${selectedMessages.length > 1 ? "s" : ""}?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(selectedMessages.map((id) => contactMessageAPI.delete(id)));
      showSuccess(`${selectedMessages.length} message${selectedMessages.length > 1 ? "s" : ""} deleted.`);
      setSelectedMessages([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleBulkMarkRead = async () => {
    if (selectedMessages.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Mark Read",
      message: `Mark ${selectedMessages.length} message${selectedMessages.length > 1 ? "s" : ""} as read?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(
        selectedMessages.map((id) => contactMessageAPI.patch(id, { is_read: true }))
      );
      showSuccess(`${selectedMessages.length} message${selectedMessages.length > 1 ? "s" : ""} marked as read.`);
      setSelectedMessages([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleBulkMarkUnread = async () => {
    if (selectedMessages.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Mark Unread",
      message: `Mark ${selectedMessages.length} message${selectedMessages.length > 1 ? "s" : ""} as unread?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(
        selectedMessages.map((id) => contactMessageAPI.patch(id, { is_read: false }))
      );
      showSuccess(`${selectedMessages.length} message${selectedMessages.length > 1 ? "s" : ""} marked as unread.`);
      setSelectedMessages([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // ─── Summary Cards ──────────────────────────────────────────────
  const summaryCards = [
    {
      title: "Total Messages",
      value: pagination.count,
      icon: MailIcon,
      color: "blue",
    },
    {
      title: "Read",
      value: messages?.filter((m) => m.is_read).length || 0,
      icon: CheckIcon,
      color: "green",
    },
    {
      title: "Unread",
      value: messages?.filter((m) => !m.is_read).length || 0,
      icon: Clock,
      color: "yellow",
    },
    {
      title: "Archived",
      value: messages?.filter((m) => m.is_read && m.is_archived).length || 0,
      icon: Archive,
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
            Contact Messages
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage messages received from the contact form
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
      {selectedMessages.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedMessages.length}
          onClearSelection={() => setSelectedMessages([])}
          onDelete={handleBulkDelete}
          onApprove={handleBulkMarkRead}
          onReject={handleBulkMarkUnread}
          loading={loading}
        />
      )}

      {/* ─── Table ─── */}
      {loading && messages.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-[var(--danger-color)]">
          Error: {error}
        </div>
      ) : (
        <ContactMessageTable
          messages={messages}
          selectedMessages={selectedMessages}
          onToggleSelect={toggleMessageSelection}
          onToggleSelectAll={toggleSelectAll}
          onSort={handleSort}
          sortConfig={sortConfig}
          onView={(message) => viewDialog.open(message.id)}
          onDelete={handleDelete}
          onToggleRead={handleToggleRead}
        />
      )}

      {/* ─── Empty State ─── */}
      {!loading && !error && messages.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)] opacity-50" />
          <p className="text-base font-medium text-[var(--sidebar-text)]">
            No messages found.
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {hasFilters
              ? "Try adjusting your search or filters"
              : "Messages from the contact form will appear here"}
          </p>
          {hasFilters && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
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
      <ContactMessageViewDialog
        isOpen={viewDialog.isOpen}
        message={viewDialog.message}
        loading={viewDialog.loading}
        onClose={viewDialog.close}
        onToggleRead={() => {
          if (viewDialog.message) {
            handleToggleRead(viewDialog.message);
            viewDialog.close();
          }
        }}
      />
    </div>
  );
};

export default ContactMessagesPage;