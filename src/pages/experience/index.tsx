// src/pages/experience/index.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Plus, RefreshCw, Eye, EyeOff, Filter, Briefcase } from "lucide-react";
import Button from "../../components/UI/Button";
import { dialogs } from "../../utils/dialogs";
import { showSuccess, showError } from "../../utils/notification";
import { usePagination } from "../../contexts/PaginationContext";

import useExperience, { type ExperienceWithDetails } from "./hooks/useExperience";
import useExperienceForm from "./hooks/useExperienceForm";
import { useExperienceView } from "./hooks/useExperienceView";
import ExperienceTable from "./components/ExperienceTable";
import ExperienceViewDialog from "./components/ExperienceViewDialog";
import ExperienceFormDialog from "./components/ExperienceFormDialog";
import FilterBar from "./components/FilterBar";
import SummaryCards from "../../components/UI/SummaryCards";
import BulkActionsBar from "../../components/UI/BulkActionsBar";
import experienceAPI from "@/api/core/experience";

import { Briefcase as BriefcaseIcon, Clock, CheckCircle } from "lucide-react";

const ExperiencePage: React.FC = () => {
  const {
    experiences,
    filters,
    loading,
    error,
    pagination,
    selectedExperiences,
    setSelectedExperiences,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleExperienceSelection,
    toggleSelectAll,
    handleSort,
    totalCount,
  } = useExperience();

  const formDialog = useExperienceForm();
  const viewDialog = useExperienceView();

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
  const handleDelete = async (item: ExperienceWithDetails) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Experience",
      message: `Are you sure you want to delete "${item.position} at ${item.company}"?`,
    });
    if (!confirmed) return;
    try {
      await experienceAPI.delete(item.id);
      showSuccess("Experience record deleted successfully.");
      reload();
    } catch (err: any) {
      dialogs.alert({ title: "Error", message: err.message });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedExperiences.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Delete ${selectedExperiences.length} experience record${selectedExperiences.length > 1 ? "s" : ""}?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(selectedExperiences.map((id) => experienceAPI.delete(id)));
      showSuccess(`${selectedExperiences.length} record${selectedExperiences.length > 1 ? "s" : ""} deleted.`);
      setSelectedExperiences([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // ─── Summary Cards ──────────────────────────────────────────────
  const summaryCards = [
    {
      title: "Total Experience",
      value: pagination.count,
      icon: BriefcaseIcon,
      color: "blue",
    },
    {
      title: "Current",
      value: experiences?.filter((e) => e.current).length || 0,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Past",
      value: experiences?.filter((e) => !e.current).length || 0,
      icon: Clock,
      color: "gray",
    },
  ];

  const hasFilters = Object.values(filters).some((v) => v);

  return (
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--sidebar-text)]">
            Work Experience
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage your professional work history
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
            Add Experience
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
      {selectedExperiences.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedExperiences.length}
          onClearSelection={() => setSelectedExperiences([])}
          onDelete={handleBulkDelete}
          loading={loading}
        />
      )}

      {/* ─── Table ─── */}
      {loading && experiences.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-[var(--danger-color)]">
          Error: {error}
        </div>
      ) : (
        <ExperienceTable
          experiences={experiences}
          selectedExperiences={selectedExperiences}
          onToggleSelect={toggleExperienceSelection}
          onToggleSelectAll={toggleSelectAll}
          onSort={handleSort}
          sortConfig={sortConfig}
          onView={(item) => viewDialog.open(item.id)}
          onEdit={formDialog.openEdit}
          onDelete={handleDelete}
        />
      )}

      {/* ─── Empty State ─── */}
      {!loading && !error && experiences.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)] opacity-50" />
          <p className="text-base font-medium text-[var(--sidebar-text)]">
            No experience records found.
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {hasFilters
              ? "Try adjusting your search or filters"
              : "Start by adding your first work experience"}
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
              Add First Experience
            </button>
          </div>
        </div>
      )}

      {/* ─── Dialogs ─── */}
      <ExperienceFormDialog
        isOpen={formDialog.isOpen}
        mode={formDialog.mode}
        experienceId={formDialog.experienceId}
        initialData={formDialog.initialData}
        onClose={formDialog.close}
        onSuccess={reload}
      />

      <ExperienceViewDialog
        isOpen={viewDialog.isOpen}
        experience={viewDialog.experience}
        loading={viewDialog.loading}
        onClose={viewDialog.close}
        onEdit={(item) => {
          formDialog.openEdit(item);
          viewDialog.close();
        }}
      />
    </div>
  );
};

export default ExperiencePage;