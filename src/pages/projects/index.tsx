// src/pages/projects/index.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Plus, RefreshCw, Eye, EyeOff, Filter, FolderOpen } from "lucide-react";
import Button from "../../components/UI/Button";
import { dialogs } from "../../utils/dialogs";
import { showSuccess, showError } from "../../utils/notification";
import { usePagination } from "../../contexts/PaginationContext";

import useProjects, { type ProjectWithDetails } from "./hooks/useProjects";
import useProjectForm from "./hooks/useProjectForm";
import { useProjectView } from "./hooks/useProjectView";
import ProjectTable from "./components/ProjectTable";
import ProjectViewDialog from "./components/ProjectViewDialog";
import ProjectFormDialog from "./components/ProjectFormDialog";
import FilterBar from "./components/FilterBar";
import SummaryCards from "../../components/UI/SummaryCards";
import BulkActionsBar from "../../components/UI/BulkActionsBar";
import projectAPI from "@/api/core/project";

import { FolderOpen as FolderIcon, Star, Globe, Github } from "lucide-react";

const ProjectsPage: React.FC = () => {
  const {
    projects,
    filters,
    loading,
    error,
    pagination,
    selectedProjects,
    setSelectedProjects,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleProjectSelection,
    toggleSelectAll,
    handleSort,
    totalCount,
  } = useProjects();

  const formDialog = useProjectForm();
  const viewDialog = useProjectView();

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
  const handleToggleFeatured = async (project: ProjectWithDetails) => {
    try {
      await projectAPI.patch(project.id, { featured: !project.featured });
      showSuccess(
        project.featured ? "Featured removed" : "Project marked as featured"
      );
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleDelete = async (project: ProjectWithDetails) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Project",
      message: `Are you sure you want to delete "${project.title}"?`,
    });
    if (!confirmed) return;
    try {
      await projectAPI.delete(project.id);
      showSuccess("Project deleted successfully.");
      reload();
    } catch (err: any) {
      dialogs.alert({ title: "Error", message: err.message });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProjects.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Delete ${selectedProjects.length} project${selectedProjects.length > 1 ? "s" : ""}?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(selectedProjects.map((id) => projectAPI.delete(id)));
      showSuccess(`${selectedProjects.length} project${selectedProjects.length > 1 ? "s" : ""} deleted.`);
      setSelectedProjects([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // ─── Summary Cards ──────────────────────────────────────────────
  const summaryCards = [
    {
      title: "Total Projects",
      value: pagination.count,
      icon: FolderIcon,
      color: "blue",
    },
    {
      title: "Featured",
      value: projects?.filter((p) => p.featured).length || 0,
      icon: Star,
      color: "yellow",
    },
    {
      title: "With Demo",
      value: projects?.filter((p) => p.demo_url).length || 0,
      icon: Globe,
      color: "green",
    },
    {
      title: "With Source Code",
      value: projects?.filter((p) => p.source_code_url).length || 0,
      icon: Github,
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
            Projects
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage your portfolio projects
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
            Add Project
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
      {selectedProjects.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedProjects.length}
          onClearSelection={() => setSelectedProjects([])}
          onDelete={handleBulkDelete}
          loading={loading}
        />
      )}

      {/* ─── Table ─── */}
      {loading && projects.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-[var(--danger-color)]">
          Error: {error}
        </div>
      ) : (
        <ProjectTable
          projects={projects}
          selectedProjects={selectedProjects}
          onToggleSelect={toggleProjectSelection}
          onToggleSelectAll={toggleSelectAll}
          onSort={handleSort}
          sortConfig={sortConfig}
          onView={(project) => viewDialog.open(project.id)}
          onEdit={formDialog.openEdit}
          onDelete={handleDelete}
          onToggleFeatured={handleToggleFeatured}
        />
      )}

      {/* ─── Empty State ─── */}
      {!loading && !error && projects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)] opacity-50" />
          <p className="text-base font-medium text-[var(--sidebar-text)]">
            No projects found.
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {hasFilters
              ? "Try adjusting your search or filters"
              : "Start by creating your first project"}
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
              Add First Project
            </button>
          </div>
        </div>
      )}

      {/* ─── Dialogs ─── */}
      <ProjectFormDialog
        isOpen={formDialog.isOpen}
        mode={formDialog.mode}
        projectId={formDialog.projectId}
        initialData={formDialog.initialData}
        onClose={formDialog.close}
        onSuccess={reload}
      />

      <ProjectViewDialog
        isOpen={viewDialog.isOpen}
        project={viewDialog.project}
        loading={viewDialog.loading}
        onClose={viewDialog.close}
        onEdit={(project) => {
          viewDialog.close();
          formDialog.openEdit(project);
        }}
      />
    </div>
  );
};

export default ProjectsPage;