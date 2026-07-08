// src/pages/categories/index.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Plus, RefreshCw, Eye, EyeOff, Filter, Tag } from "lucide-react";
import Button from "../../components/UI/Button";
import { dialogs } from "../../utils/dialogs";
import { showSuccess, showError } from "../../utils/notification";
import { usePagination } from "../../contexts/PaginationContext";

import useCategories, { type CategoryWithDetails } from "./hooks/useCategories";
import useCategoryForm from "./hooks/useCategoryForm";
import { useCategoryView } from "./hooks/useCategoryView";
import CategoryTable from "./components/CategoryTable";
import CategoryViewDialog from "./components/CategoryViewDialog";
import CategoryFormDialog from "./components/CategoryFormDialog";
import FilterBar from "./components/FilterBar";
import SummaryCards from "../../components/UI/SummaryCards";
import BulkActionsBar from "../../components/UI/BulkActionsBar";
import categoryAPI from "@/api/core/category";
import { useBlogView } from "../blog/hooks/useBlogView";
import BlogViewDialog from "../blog/components/BlogViewDialog";
import BlogFormDialog from "../blog/components/BlogFormDialog";
import useBlogForm from "../blog/hooks/useBlogForm";

import { Tag as TagIcon, Star, FolderOpen } from "lucide-react";

const CategoriesPage: React.FC = () => {
  const {
    categories,
    filters,
    loading,
    error,
    pagination,
    selectedCategories,
    setSelectedCategories,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleCategorySelection,
    toggleSelectAll,
    handleSort,
    totalCount,
  } = useCategories();

  const formDialog = useCategoryForm();
  const viewDialog = useCategoryView();
  const blogFormDialog = useBlogForm();
  const blogViewDialog = useBlogView();

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
  const handleToggleFeatured = async (category: CategoryWithDetails) => {
    try {
      await categoryAPI.patch(category.id, { featured: !category.featured });
      showSuccess(
        category.featured ? "Featured removed" : "Category marked as featured"
      );
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleDelete = async (category: CategoryWithDetails) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Category",
      message: `Are you sure you want to delete "${category.name}"?`,
    });
    if (!confirmed) return;
    try {
      await categoryAPI.delete(category.id);
      showSuccess("Category deleted successfully.");
      reload();
    } catch (err: any) {
      dialogs.alert({ title: "Error", message: err.message });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Delete ${selectedCategories.length} categor${selectedCategories.length > 1 ? "ies" : "y"}?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(selectedCategories.map((id) => categoryAPI.delete(id)));
      showSuccess(`${selectedCategories.length} categor${selectedCategories.length > 1 ? "ies" : "y"} deleted.`);
      setSelectedCategories([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // ─── Summary Cards ──────────────────────────────────────────────
  const summaryCards = [
    {
      title: "Total Categories",
      value: pagination.count,
      icon: TagIcon,
      color: "blue",
    },
    {
      title: "Featured",
      value: categories?.filter((c) => c.featured).length || 0,
      icon: Star,
      color: "yellow",
    },
    {
      title: "With Blogs",
      value: categories?.filter((c) => c.blog_count > 0).length || 0,
      icon: FolderOpen,
      color: "green",
    },
    {
      title: "Not Featured",
      value: categories?.filter((c) => !c.featured).length || 0,
      icon: Tag,
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
            Categories
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Organize your blogs with categories
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
            Add Category
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
      {selectedCategories.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedCategories.length}
          onClearSelection={() => setSelectedCategories([])}
          onDelete={handleBulkDelete}
          loading={loading}
        />
      )}

      {/* ─── Table ─── */}
      {loading && categories.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-[var(--danger-color)]">
          Error: {error}
        </div>
      ) : (
        <CategoryTable
          categories={categories}
          selectedCategories={selectedCategories}
          onToggleSelect={toggleCategorySelection}
          onToggleSelectAll={toggleSelectAll}
          onSort={handleSort}
          sortConfig={sortConfig}
          onView={(cat) => viewDialog.open(cat.id)}
          onEdit={formDialog.openEdit}
          onDelete={handleDelete}
          onToggleFeatured={handleToggleFeatured}
        />
      )}

      {/* ─── Empty State ─── */}
      {!loading && !error && categories.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)] opacity-50" />
          <p className="text-base font-medium text-[var(--sidebar-text)]">
            No categories found.
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {hasFilters
              ? "Try adjusting your search or filters"
              : "Start by creating your first category"}
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
              Add First Category
            </button>
          </div>
        </div>
      )}

      {/* ─── Dialogs ─── */}
      <CategoryFormDialog
        isOpen={formDialog.isOpen}
        mode={formDialog.mode}
        categoryId={formDialog.categoryId}
        initialData={formDialog.initialData}
        onClose={formDialog.close}
        onSuccess={reload}
      />

      <CategoryViewDialog
        isOpen={viewDialog.isOpen}
        category={viewDialog.category}
        blogs={viewDialog.blogs}
        loading={viewDialog.loading}
        loadingBlogs={viewDialog.loadingBlogs}
        onClose={viewDialog.close}
        onEdit={(category) => {
          formDialog.openEdit(category);
          viewDialog.close();
        }}
        onFetchBlogs={viewDialog.fetchBlogs}
        onBlogView={(blog) => {
          viewDialog.close();
          blogViewDialog.open(blog.id);
        }}
      />

      <BlogViewDialog
        isOpen={blogViewDialog.isOpen}
        blog={blogViewDialog.blog}
        comments={blogViewDialog.comments}
        loading={blogViewDialog.loading}
        loadingComments={blogViewDialog.loadingComments}
        onClose={blogViewDialog.close}
        onEdit={(blog) => {
          blogFormDialog.openEdit(blog);
          blogViewDialog.close();
        }}
        onFetchComments={blogViewDialog.fetchComments}
      />
    </div>
  );
};

export default CategoriesPage;