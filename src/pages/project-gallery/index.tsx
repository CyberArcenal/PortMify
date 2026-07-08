// src/pages/project-gallery/index.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Plus, RefreshCw, Eye, EyeOff, Filter, Image } from "lucide-react";
import Button from "../../components/UI/Button";
import { dialogs } from "../../utils/dialogs";
import { showSuccess, showError } from "../../utils/notification";
import { usePagination } from "../../contexts/PaginationContext";

import useProjectGallery, {
  type ProjectGalleryImageWithDetails,
} from "./hooks/useProjectGallery";
import useProjectGalleryForm from "./hooks/useProjectGalleryForm";
import { useProjectGalleryView } from "./hooks/useProjectGalleryView";
import ProjectGalleryTable from "./components/ProjectGalleryTable";
import ProjectGalleryViewDialog from "./components/ProjectGalleryViewDialog";
import ProjectGalleryFormDialog from "./components/ProjectGalleryFormDialog";
import FilterBar from "./components/FilterBar";
import SummaryCards from "../../components/UI/SummaryCards";
import BulkActionsBar from "../../components/UI/BulkActionsBar";
import ProjectSelect from "@/components/Selects/Project";
import projectGalleryAPI from "@/api/core/project_gallery";

import { Image as ImageIcon, ListOrdered } from "lucide-react";

const ProjectGalleryPage: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedProjectName, setSelectedProjectName] = useState<string>("");

  const {
    images,
    filters,
    loading,
    error,
    pagination,
    selectedImages,
    setSelectedImages,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleImageSelection,
    toggleSelectAll,
    handleSort,
    totalCount,
  } = useProjectGallery(selectedProjectId);

  const formDialog = useProjectGalleryForm();
  const viewDialog = useProjectGalleryView();

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
  const handleDelete = async (image: ProjectGalleryImageWithDetails) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Image",
      message: `Are you sure you want to delete this image?`,
    });
    if (!confirmed) return;
    try {
      await projectGalleryAPI.delete(image.project, image.id);
      showSuccess("Image deleted successfully.");
      reload();
    } catch (err: any) {
      dialogs.alert({ title: "Error", message: err.message });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedImages.length === 0 || !selectedProjectId) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Delete ${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""}?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(
        selectedImages.map((id) => projectGalleryAPI.delete(selectedProjectId, id))
      );
      showSuccess(`${selectedImages.length} image${selectedImages.length > 1 ? "s" : ""} deleted.`);
      setSelectedImages([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleProjectChange = (projectId: number | null, project?: any) => {
    setSelectedProjectId(projectId);
    setSelectedProjectName(project?.title || "");
    setCurrentPage(1);
  };

  // ─── Summary Cards ──────────────────────────────────────────────
  const summaryCards = [
    {
      title: "Total Images",
      value: pagination.count,
      icon: ImageIcon,
      color: "blue",
    },
    {
      title: "Current Project",
      value: selectedProjectName || "None",
      icon: Image,
      color: "green",
    },
    {
      title: "Images Loaded",
      value: images?.length || 0,
      icon: ListOrdered,
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
            Project Gallery
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage images for your project galleries
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
            disabled={!selectedProjectId}
          >
            Add Image
          </Button>
        </div>
      </div>

      {/* ─── Summary Cards ─── */}
      {showStats && <SummaryCards cards={summaryCards} columns={3} />}

      {/* ─── Project Selector ─── */}
      <div className="bg-[var(--card-secondary-bg)] rounded-xl p-4">
        <label className="block text-sm font-medium mb-1 text-[var(--sidebar-text)]">
          Select Project
        </label>
        <ProjectSelect
          onChange={(projectId, project) => {
            handleProjectChange(projectId, project);
          }}
          value={selectedProjectId || null}
        />
      </div>

      {/* ─── Filter Bar ─── */}
      {showFilters && (
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
        />
      )}

      {/* ─── Bulk Actions ─── */}
      {selectedImages.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedImages.length}
          onClearSelection={() => setSelectedImages([])}
          onDelete={handleBulkDelete}
          loading={loading}
        />
      )}

      {/* ─── Table ─── */}
      {loading && images.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-[var(--danger-color)]">
          Error: {error}
        </div>
      ) : !selectedProjectId ? (
        <div className="text-center py-12 border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
          <Image className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)] opacity-50" />
          <p className="text-base font-medium text-[var(--sidebar-text)]">
            Please select a project to view its gallery.
          </p>
        </div>
      ) : (
        <ProjectGalleryTable
          images={images}
          selectedImages={selectedImages}
          onToggleSelect={toggleImageSelection}
          onToggleSelectAll={toggleSelectAll}
          onSort={handleSort}
          sortConfig={sortConfig}
          onView={(image) => viewDialog.open(image.id)}
          onEdit={(image) => {
            formDialog.openEdit(image);
          }}
          onDelete={handleDelete}
        />
      )}

      {/* ─── Empty State ─── */}
      {!loading && !error && selectedProjectId && images.length === 0 && (
        <div className="text-center py-12">
          <Image className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)] opacity-50" />
          <p className="text-base font-medium text-[var(--sidebar-text)]">
            No images found for this project.
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {hasFilters
              ? "Try adjusting your search filters"
              : "Start by adding your first image"}
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
              Add First Image
            </button>
          </div>
        </div>
      )}

      {/* ─── Dialogs ─── */}
      <ProjectGalleryFormDialog
        isOpen={formDialog.isOpen}
        mode={formDialog.mode}
        imageId={formDialog.imageId}
        initialData={formDialog.initialData}
        projectId={selectedProjectId}
        onClose={formDialog.close}
        onSuccess={reload}
      />

      <ProjectGalleryViewDialog
        isOpen={viewDialog.isOpen}
        image={viewDialog.image}
        loading={viewDialog.loading}
        onClose={viewDialog.close}
        onEdit={(image) => {
          formDialog.openEdit(image);
          viewDialog.close();
        }}
      />
    </div>
  );
};

export default ProjectGalleryPage;