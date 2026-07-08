// src/pages/skills/index.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Plus, RefreshCw, Eye, EyeOff, Filter, Code } from "lucide-react";
import Button from "../../components/UI/Button";
import { dialogs } from "../../utils/dialogs";
import { showSuccess, showError } from "../../utils/notification";
import { usePagination } from "../../contexts/PaginationContext";

import useSkills, { type SkillWithDetails } from "./hooks/useSkills";
import useSkillForm from "./hooks/useSkillForm";
import { useSkillView } from "./hooks/useSkillView";
import SkillTable from "./components/SkillTable";
import SkillViewDialog from "./components/SkillViewDialog";
import SkillFormDialog from "./components/SkillFormDialog";
import FilterBar from "./components/FilterBar";
import SummaryCards from "../../components/UI/SummaryCards";
import BulkActionsBar from "../../components/UI/BulkActionsBar";
import skillAPI from "@/api/core/skill";

import { Code as CodeIcon, Star, Layers, TrendingUp } from "lucide-react";

const SkillsPage: React.FC = () => {
  const {
    skills,
    filters,
    loading,
    error,
    pagination,
    selectedSkills,
    setSelectedSkills,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleSkillSelection,
    toggleSelectAll,
    handleSort,
    totalCount,
  } = useSkills();

  const formDialog = useSkillForm();
  const viewDialog = useSkillView();

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
  const handleToggleFeatured = async (skill: SkillWithDetails) => {
    try {
      await skillAPI.patch(skill.id, { featured: !skill.featured });
      showSuccess(
        skill.featured ? "Removed from featured" : "Marked as featured"
      );
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleDelete = async (skill: SkillWithDetails) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Skill",
      message: `Are you sure you want to delete "${skill.name}"?`,
    });
    if (!confirmed) return;
    try {
      await skillAPI.delete(skill.id);
      showSuccess("Skill deleted successfully.");
      reload();
    } catch (err: any) {
      dialogs.alert({ title: "Error", message: err.message });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSkills.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Delete ${selectedSkills.length} skill${selectedSkills.length > 1 ? "s" : ""}?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(selectedSkills.map((id) => skillAPI.delete(id)));
      showSuccess(`${selectedSkills.length} skill${selectedSkills.length > 1 ? "s" : ""} deleted.`);
      setSelectedSkills([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // ─── Summary Cards ──────────────────────────────────────────────
  const avgProficiency = skills?.length > 0
    ? Math.round(skills.reduce((acc, s) => acc + s.proficiency, 0) / skills.length)
    : 0;

  const uniqueCategories = skills
    ? [...new Set(skills.map((s) => s.category_display || s.category))]
    : [];

  const summaryCards = [
    {
      title: "Total Skills",
      value: pagination.count,
      icon: CodeIcon,
      color: "blue",
    },
    {
      title: "Featured",
      value: skills?.filter((s) => s.featured).length || 0,
      icon: Star,
      color: "yellow",
    },
    {
      title: "Categories",
      value: uniqueCategories.length,
      icon: Layers,
      color: "purple",
    },
    {
      title: "Avg Proficiency",
      value: `${avgProficiency}%`,
      icon: TrendingUp,
      color: "green",
    },
  ];

  const hasFilters = Object.values(filters).some((v) => v);

  return (
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--sidebar-text)]">
            Skills
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage your technical and professional skills
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
            Add Skill
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
      {selectedSkills.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedSkills.length}
          onClearSelection={() => setSelectedSkills([])}
          onDelete={handleBulkDelete}
          loading={loading}
        />
      )}

      {/* ─── Table ─── */}
      {loading && skills.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-[var(--danger-color)]">
          Error: {error}
        </div>
      ) : (
        <SkillTable
          skills={skills}
          selectedSkills={selectedSkills}
          onToggleSelect={toggleSkillSelection}
          onToggleSelectAll={toggleSelectAll}
          onSort={handleSort}
          sortConfig={sortConfig}
          onView={(skill) => viewDialog.open(skill.id)}
          onEdit={formDialog.openEdit}
          onDelete={handleDelete}
          onToggleFeatured={handleToggleFeatured}
        />
      )}

      {/* ─── Empty State ─── */}
      {!loading && !error && skills.length === 0 && (
        <div className="text-center py-12">
          <Code className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)] opacity-50" />
          <p className="text-base font-medium text-[var(--sidebar-text)]">
            No skills found.
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {hasFilters
              ? "Try adjusting your search or filters"
              : "Start by adding your first skill"}
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
              Add First Skill
            </button>
          </div>
        </div>
      )}

      {/* ─── Dialogs ─── */}
      <SkillFormDialog
        isOpen={formDialog.isOpen}
        mode={formDialog.mode}
        skillId={formDialog.skillId}
        initialData={formDialog.initialData}
        onClose={formDialog.close}
        onSuccess={reload}
      />

      <SkillViewDialog
        isOpen={viewDialog.isOpen}
        skill={viewDialog.skill}
        loading={viewDialog.loading}
        onClose={viewDialog.close}
        onEdit={(skill) => {
          formDialog.openEdit(skill);
          viewDialog.close();
        }}
        onToggleFeatured={handleToggleFeatured}
      />
    </div>
  );
};

export default SkillsPage;