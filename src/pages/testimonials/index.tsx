// src/pages/testimonials/index.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Plus, RefreshCw, Eye, EyeOff, Filter, MessageSquare } from "lucide-react";
import Button from "../../components/UI/Button";
import { dialogs } from "../../utils/dialogs";
import { showSuccess, showError } from "../../utils/notification";
import { usePagination } from "../../contexts/PaginationContext";

import useTestimonials, {
  type TestimonialWithDetails,
} from "./hooks/useTestimonials";
import useTestimonialForm from "./hooks/useTestimonialForm";
import { useTestimonialView } from "./hooks/useTestimonialView";
import TestimonialTable from "./components/TestimonialTable";
import TestimonialViewDialog from "./components/TestimonialViewDialog";
import TestimonialFormDialog from "./components/TestimonialFormDialog";
import FilterBar from "./components/FilterBar";
import SummaryCards from "../../components/UI/SummaryCards";
import BulkActionsBar from "../../components/UI/BulkActionsBar";
import testimonialAPI from "@/api/core/testimonial";

import { MessageSquare as MessageIcon, Star, CheckCircle, Clock } from "lucide-react";

const TestimonialsPage: React.FC = () => {
  const {
    testimonials,
    filters,
    loading,
    error,
    pagination,
    selectedTestimonials,
    setSelectedTestimonials,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleTestimonialSelection,
    toggleSelectAll,
    handleSort,
    totalCount,
  } = useTestimonials();

  const formDialog = useTestimonialForm();
  const viewDialog = useTestimonialView();

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
  const handleToggleFeatured = async (testimonial: TestimonialWithDetails) => {
    try {
      await testimonialAPI.patch(testimonial.id, {
        featured: !testimonial.featured,
      });
      showSuccess(
        testimonial.featured ? "Removed from featured" : "Marked as featured",
      );
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleToggleApproved = async (testimonial: TestimonialWithDetails) => {
    if (
      !(await dialogs.confirm({
        title: `${testimonial.approved ? "Unapprove" : "Approve"} Testimonial`,
        message: `Are you sure you want to ${testimonial.approved ? "unapprove" : "approve"} this testimonial?`,
      }))
    )
      return;
    try {
      await testimonialAPI.patch(testimonial.id, {
        approved: !testimonial.approved,
      });
      showSuccess(testimonial.approved ? "Unapproved" : "Approved");
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleDelete = async (testimonial: TestimonialWithDetails) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Testimonial",
      message: `Are you sure you want to delete testimonial from "${testimonial.author}"?`,
    });
    if (!confirmed) return;
    try {
      await testimonialAPI.delete(testimonial.id);
      showSuccess("Testimonial deleted successfully.");
      reload();
    } catch (err: any) {
      dialogs.alert({ title: "Error", message: err.message });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTestimonials.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Delete ${selectedTestimonials.length} testimonial${selectedTestimonials.length > 1 ? "s" : ""}?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(selectedTestimonials.map((id) => testimonialAPI.delete(id)));
      showSuccess(`${selectedTestimonials.length} testimonial${selectedTestimonials.length > 1 ? "s" : ""} deleted.`);
      setSelectedTestimonials([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedTestimonials.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Approve",
      message: `Approve ${selectedTestimonials.length} testimonial${selectedTestimonials.length > 1 ? "s" : ""}?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(
        selectedTestimonials.map((id) => testimonialAPI.patch(id, { approved: true }))
      );
      showSuccess(`${selectedTestimonials.length} testimonial${selectedTestimonials.length > 1 ? "s" : ""} approved.`);
      setSelectedTestimonials([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleBulkUnapprove = async () => {
    if (selectedTestimonials.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Unapprove",
      message: `Unapprove ${selectedTestimonials.length} testimonial${selectedTestimonials.length > 1 ? "s" : ""}?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(
        selectedTestimonials.map((id) => testimonialAPI.patch(id, { approved: false }))
      );
      showSuccess(`${selectedTestimonials.length} testimonial${selectedTestimonials.length > 1 ? "s" : ""} unapproved.`);
      setSelectedTestimonials([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // ─── Summary Cards ──────────────────────────────────────────────
  const summaryCards = [
    {
      title: "Total Testimonials",
      value: pagination.count,
      icon: MessageIcon,
      color: "blue",
    },
    {
      title: "Featured",
      value: testimonials?.filter((t) => t.featured).length || 0,
      icon: Star,
      color: "yellow",
    },
    {
      title: "Approved",
      value: testimonials?.filter((t) => t.approved).length || 0,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Pending",
      value: testimonials?.filter((t) => !t.approved).length || 0,
      icon: Clock,
      color: "red",
    },
  ];

  const hasFilters = Object.values(filters).some((v) => v);

  return (
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--sidebar-text)]">
            Testimonials
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage client testimonials and reviews
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
            Add Testimonial
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
      {selectedTestimonials.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedTestimonials.length}
          onClearSelection={() => setSelectedTestimonials([])}
          onDelete={handleBulkDelete}
          onApprove={handleBulkApprove}
          onReject={handleBulkUnapprove}
          loading={loading}
        />
      )}

      {/* ─── Table ─── */}
      {loading && testimonials.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-[var(--danger-color)]">
          Error: {error}
        </div>
      ) : (
        <TestimonialTable
          testimonials={testimonials}
          selectedTestimonials={selectedTestimonials}
          onToggleSelect={toggleTestimonialSelection}
          onToggleSelectAll={toggleSelectAll}
          onSort={handleSort}
          sortConfig={sortConfig}
          onView={(testimonial) => viewDialog.open(testimonial.id)}
          onEdit={formDialog.openEdit}
          onDelete={handleDelete}
          onToggleFeatured={handleToggleFeatured}
          onToggleApproved={handleToggleApproved}
        />
      )}

      {/* ─── Empty State ─── */}
      {!loading && !error && testimonials.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)] opacity-50" />
          <p className="text-base font-medium text-[var(--sidebar-text)]">
            No testimonials found.
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {hasFilters
              ? "Try adjusting your search or filters"
              : "Start by adding your first testimonial"}
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
              Add First Testimonial
            </button>
          </div>
        </div>
      )}

      {/* ─── Dialogs ─── */}
      <TestimonialFormDialog
        isOpen={formDialog.isOpen}
        mode={formDialog.mode}
        testimonialId={formDialog.testimonialId}
        initialData={formDialog.initialData}
        onClose={formDialog.close}
        onSuccess={reload}
      />

      <TestimonialViewDialog
        isOpen={viewDialog.isOpen}
        testimonial={viewDialog.testimonial}
        loading={viewDialog.loading}
        onClose={viewDialog.close}
        onEdit={(testimonial) => {
          formDialog.openEdit(testimonial);
          viewDialog.close();
        }}
        onToggleFeatured={handleToggleFeatured}
        onToggleApproved={handleToggleApproved}
      />
    </div>
  );
};

export default TestimonialsPage;