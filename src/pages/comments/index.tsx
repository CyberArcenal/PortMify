// src/pages/comments/index.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Plus, RefreshCw, Eye, EyeOff, Filter, MessageSquare } from "lucide-react";
import Button from "../../components/UI/Button";
import { dialogs } from "../../utils/dialogs";
import { showSuccess, showError } from "../../utils/notification";
import { usePagination } from "../../contexts/PaginationContext";

import useComments, { type CommentWithDetails } from "./hooks/useComments";
import useCommentForm from "./hooks/useCommentForm";
import { useCommentView } from "./hooks/useCommentView";
import CommentTable from "./components/CommentTable";
import CommentViewDialog from "./components/CommentViewDialog";
import CommentFormDialog from "./components/CommentFormDialog";
import FilterBar from "./components/FilterBar";
import SummaryCards from "../../components/UI/SummaryCards";
import BulkActionsBar from "../../components/UI/BulkActionsBar";
import commentAPI from "@/api/core/comment";

import { MessageSquare as MsgIcon, CheckCircle, XCircle, Clock } from "lucide-react";

const CommentsPage: React.FC = () => {
  const {
    comments,
    filters,
    loading,
    error,
    pagination,
    selectedComments,
    setSelectedComments,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleCommentSelection,
    toggleSelectAll,
    handleSort,
    totalCount,
  } = useComments();

  const formDialog = useCommentForm();
  const viewDialog = useCommentView();

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
  const handleToggleApproved = async (comment: CommentWithDetails) => {
    try {
      await commentAPI.patch(comment.id, { approved: !comment.approved });
      showSuccess(
        comment.approved ? "Comment unapproved" : "Comment approved"
      );
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleDelete = async (comment: CommentWithDetails) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Comment",
      message: `Are you sure you want to delete this comment?`,
    });
    if (!confirmed) return;
    try {
      await commentAPI.delete(comment.id);
      showSuccess("Comment deleted successfully.");
      reload();
    } catch (err: any) {
      dialogs.alert({ title: "Error", message: err.message });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedComments.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Delete ${selectedComments.length} comment${selectedComments.length > 1 ? "s" : ""}?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(selectedComments.map((id) => commentAPI.delete(id)));
      showSuccess(`${selectedComments.length} comment${selectedComments.length > 1 ? "s" : ""} deleted.`);
      setSelectedComments([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedComments.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Approve",
      message: `Approve ${selectedComments.length} comment${selectedComments.length > 1 ? "s" : ""}?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(
        selectedComments.map((id) => commentAPI.patch(id, { approved: true }))
      );
      showSuccess(`${selectedComments.length} comment${selectedComments.length > 1 ? "s" : ""} approved.`);
      setSelectedComments([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleBulkUnapprove = async () => {
    if (selectedComments.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Unapprove",
      message: `Unapprove ${selectedComments.length} comment${selectedComments.length > 1 ? "s" : ""}?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(
        selectedComments.map((id) => commentAPI.patch(id, { approved: false }))
      );
      showSuccess(`${selectedComments.length} comment${selectedComments.length > 1 ? "s" : ""} unapproved.`);
      setSelectedComments([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // ─── Summary Cards ──────────────────────────────────────────────
  const summaryCards = [
    {
      title: "Total Comments",
      value: pagination.count,
      icon: MsgIcon,
      color: "blue",
    },
    {
      title: "Approved",
      value: comments?.filter((c) => c.approved).length || 0,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Pending",
      value: comments?.filter((c) => !c.approved).length || 0,
      icon: Clock,
      color: "yellow",
    },
    {
      title: "With Replies",
      value: comments?.filter((c) => c.replies?.length > 0).length || 0,
      icon: MessageSquare,
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
            Comments
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage user comments on blogs and projects
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
          <Button
            onClick={formDialog.openAdd}
            variant="primary"
            size="sm"
            icon={Plus}
            iconPosition="left"
          >
            Add Comment
          </Button>
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
      {selectedComments.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedComments.length}
          onClearSelection={() => setSelectedComments([])}
          onDelete={handleBulkDelete}
          onApprove={handleBulkApprove}
          onReject={handleBulkUnapprove}
          loading={loading}
        />
      )}

      {/* ─── Table ─── */}
      {loading && comments.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-[var(--danger-color)]">
          Error: {error}
        </div>
      ) : (
        <CommentTable
          comments={comments}
          selectedComments={selectedComments}
          onToggleSelect={toggleCommentSelection}
          onToggleSelectAll={toggleSelectAll}
          onSort={handleSort}
          sortConfig={sortConfig}
          onView={(comment) => viewDialog.open(comment.id)}
          onEdit={formDialog.openEdit}
          onDelete={handleDelete}
          onToggleApproved={handleToggleApproved}
        />
      )}

      {/* ─── Empty State ─── */}
      {!loading && !error && comments.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)] opacity-50" />
          <p className="text-base font-medium text-[var(--sidebar-text)]">
            No comments found.
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {hasFilters
              ? "Try adjusting your search or filters"
              : "Start by creating your first comment"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {hasFilters && (
              <button
                className="px-4 py-2 rounded-lg text-sm bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors"
                onClick={resetFilters}
              >
                Clear Filters
              </button>
            )}
            <button
              className="px-4 py-2 rounded-lg text-sm bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors"
              onClick={formDialog.openAdd}
            >
              Add First Comment
            </button>
          </div>
        </div>
      )}

      {/* ─── Dialogs ─── */}
      <CommentFormDialog
        isOpen={formDialog.isOpen}
        mode={formDialog.mode}
        commentId={formDialog.commentId}
        initialData={formDialog.initialData}
        onClose={formDialog.close}
        onSuccess={reload}
      />

      <CommentViewDialog
        isOpen={viewDialog.isOpen}
        comment={viewDialog.comment}
        loading={viewDialog.loading}
        replies={viewDialog.replies}
        loadingReplies={viewDialog.loadingReplies}
        onClose={viewDialog.close}
        onEdit={(comment) => {
          formDialog.openEdit(comment);
          viewDialog.close();
        }}
        onFetchReplies={viewDialog.fetchReplies}
        onToggleApproved={handleToggleApproved}
      />
    </div>
  );
};

export default CommentsPage;