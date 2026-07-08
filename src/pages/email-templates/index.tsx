// src/pages/email-templates/index.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Plus, RefreshCw, Eye, EyeOff, Filter, Mail } from "lucide-react";
import Button from "../../components/UI/Button";
import { dialogs } from "../../utils/dialogs";
import { showSuccess, showError } from "../../utils/notification";
import { usePagination } from "../../contexts/PaginationContext";

import useEmailTemplates, { type EmailTemplateWithDetails } from "./hooks/useEmailTemplates";
import useEmailTemplateForm from "./hooks/useEmailTemplateForm";
import { useEmailTemplateView } from "./hooks/useEmailTemplateView";
import EmailTemplateTable from "./components/EmailTemplateTable";
import EmailTemplateViewDialog from "./components/EmailTemplateViewDialog";
import EmailTemplateFormDialog from "./components/EmailTemplateFormDialog";
import FilterBar from "./components/FilterBar";
import SummaryCards from "../../components/UI/SummaryCards";
import BulkActionsBar from "../../components/UI/BulkActionsBar";
import emailTemplateAPI from "@/api/core/email_template";

import { Mail as MailIcon, FileText, Clock } from "lucide-react";

const EmailTemplatesPage: React.FC = () => {
  const {
    templates,
    filters,
    loading,
    error,
    pagination,
    selectedTemplates,
    setSelectedTemplates,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleTemplateSelection,
    toggleSelectAll,
    handleSort,
    totalCount,
  } = useEmailTemplates();

  const formDialog = useEmailTemplateForm();
  const viewDialog = useEmailTemplateView();

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
  const handleDelete = async (template: EmailTemplateWithDetails) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Template",
      message: `Are you sure you want to delete "${template.name}"?`,
    });
    if (!confirmed) return;
    try {
      await emailTemplateAPI.delete(template.id);
      showSuccess("Email template deleted successfully.");
      reload();
    } catch (err: any) {
      dialogs.alert({ title: "Error", message: err.message });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTemplates.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Delete ${selectedTemplates.length} template${selectedTemplates.length > 1 ? "s" : ""}?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(selectedTemplates.map((id) => emailTemplateAPI.delete(id)));
      showSuccess(`${selectedTemplates.length} template${selectedTemplates.length > 1 ? "s" : ""} deleted.`);
      setSelectedTemplates([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // ─── Summary Cards ──────────────────────────────────────────────
  const summaryCards = [
    {
      title: "Total Templates",
      value: pagination.count,
      icon: MailIcon,
      color: "blue",
    },
    {
      title: "Recent",
      value: templates?.length || 0,
      icon: FileText,
      color: "green",
    },
    {
      title: "Modified",
      value: templates?.filter((t) => 
        new Date(t.modified_at).getTime() > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime()
      ).length || 0,
      icon: Clock,
      color: "yellow",
    },
  ];

  const hasFilters = Object.values(filters).some((v) => v);

  return (
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--sidebar-text)]">
            Email Templates
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage email templates for automated responses
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
            Add Template
          </Button>
        </div>
      </div>

      {/* ─── Summary Cards ─── */}
      {showStats && <SummaryCards cards={summaryCards} columns={3} />}

      {/* ─── Filter Bar ─── */}
      {showFilters && (
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
        />
      )}

      {/* ─── Bulk Actions ─── */}
      {selectedTemplates.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedTemplates.length}
          onClearSelection={() => setSelectedTemplates([])}
          onDelete={handleBulkDelete}
          loading={loading}
        />
      )}

      {/* ─── Table ─── */}
      {loading && templates.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-[var(--danger-color)]">
          Error: {error}
        </div>
      ) : (
        <EmailTemplateTable
          templates={templates}
          selectedTemplates={selectedTemplates}
          onToggleSelect={toggleTemplateSelection}
          onToggleSelectAll={toggleSelectAll}
          onSort={handleSort}
          sortConfig={sortConfig}
          onView={(template) => viewDialog.open(template.id)}
          onEdit={formDialog.openEdit}
          onDelete={handleDelete}
        />
      )}

      {/* ─── Empty State ─── */}
      {!loading && !error && templates.length === 0 && (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)] opacity-50" />
          <p className="text-base font-medium text-[var(--sidebar-text)]">
            No email templates found.
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {hasFilters
              ? "Try adjusting your search or filters"
              : "Start by creating your first email template"}
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
              Add First Template
            </button>
          </div>
        </div>
      )}

      {/* ─── Dialogs ─── */}
      <EmailTemplateFormDialog
        isOpen={formDialog.isOpen}
        mode={formDialog.mode}
        templateId={formDialog.templateId}
        initialData={formDialog.initialData}
        onClose={formDialog.close}
        onSuccess={reload}
      />

      <EmailTemplateViewDialog
        isOpen={viewDialog.isOpen}
        template={viewDialog.template}
        loading={viewDialog.loading}
        onClose={viewDialog.close}
        onEdit={(template) => {
          formDialog.openEdit(template);
          viewDialog.close();
        }}
      />
    </div>
  );
};

export default EmailTemplatesPage;