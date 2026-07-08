// src/pages/blog/index.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Plus, RefreshCw, Eye, EyeOff, Filter } from "lucide-react";
import Button from "../../components/UI/Button";
import { dialogs } from "../../utils/dialogs";
import { showSuccess, showError } from "../../utils/notification";
import { usePagination } from "../../contexts/PaginationContext";

import useBlogs, { type BlogWithDetails } from "./hooks/useBlogs";
import useBlogForm from "./hooks/useBlogForm";
import { useBlogView } from "./hooks/useBlogView";
import BlogTable from "./components/BlogTable";
import BlogViewDialog from "./components/BlogViewDialog";
import BlogFormDialog from "./components/BlogFormDialog";
import FilterBar from "./components/FilterBar";
import blogAPI from "@/api/core/blog";

import { FileText, CheckCircle, Clock, Star } from "lucide-react";
import SummaryCards from "@/components/UI/SummaryCards";
import BulkActionsBar from "@/components/UI/BulkActionsBar";

const BlogsPage: React.FC = () => {
  const {
    blogs,
    filters,
    loading,
    error,
    pagination,
    selectedBlogs,
    setSelectedBlogs,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleBlogSelection,
    toggleSelectAll,
    handleSort,
    totalCount,
  } = useBlogs();

  const formDialog = useBlogForm();
  const viewDialog = useBlogView();

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
  const handleToggleFeatured = async (blog: BlogWithDetails) => {
    try {
      await blogAPI.patch(blog.id, { featured: !blog.featured });
      showSuccess(blog.featured ? "Featured removed" : "Blog marked as featured");
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleToggleStatus = async (blog: BlogWithDetails) => {
    const newStatus = blog.status === "published" ? "draft" : "published";
    try {
      await blogAPI.patch(blog.id, { status: newStatus });
      showSuccess(`Blog ${newStatus === "published" ? "published" : "unpublished"}`);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleDelete = async (blog: BlogWithDetails) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Blog",
      message: `Are you sure you want to delete "${blog.title}"?`,
    });
    if (!confirmed) return;
    try {
      await blogAPI.delete(blog.id);
      showSuccess("Blog deleted successfully.");
      reload();
    } catch (err: any) {
      dialogs.alert({ title: "Error", message: err.message });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBlogs.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Delete ${selectedBlogs.length} blog${selectedBlogs.length > 1 ? "s" : ""}?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(selectedBlogs.map((id) => blogAPI.delete(id)));
      showSuccess(`${selectedBlogs.length} blog${selectedBlogs.length > 1 ? "s" : ""} deleted.`);
      setSelectedBlogs([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleBulkStatusChange = async (newStatus: "published" | "draft") => {
    if (selectedBlogs.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: `Bulk ${newStatus === "published" ? "Publish" : "Unpublish"}`,
      message: `${newStatus === "published" ? "Publish" : "Unpublish"} ${selectedBlogs.length} blog${selectedBlogs.length > 1 ? "s" : ""}?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(
        selectedBlogs.map((id) => blogAPI.patch(id, { status: newStatus }))
      );
      showSuccess(`${selectedBlogs.length} blog${selectedBlogs.length > 1 ? "s" : ""} ${newStatus === "published" ? "published" : "unpublished"}.`);
      setSelectedBlogs([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // ─── Summary Cards ──────────────────────────────────────────────
  const summaryCards = [
    {
      title: "Total Posts",
      value: pagination.count,
      icon: FileText,
      color: "blue",
    },
    {
      title: "Published",
      value: blogs?.filter((b) => b.status === "published").length || 0,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Drafts",
      value: blogs?.filter((b) => b.status === "draft").length || 0,
      icon: Clock,
      color: "yellow",
    },
    {
      title: "Featured",
      value: blogs?.filter((b) => b.featured).length || 0,
      icon: Star,
      color: "purple",
    },
  ];

  const hasFilters = Object.values(filters).some((v) => v);

  return (
    <div className="space-y-4">
      {/* ─── Header (walang border) ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--sidebar-text)]">
            Blog Posts
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage your blog content
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
            Add Blog
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
      {selectedBlogs.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedBlogs.length}
          onClearSelection={() => setSelectedBlogs([])}
          onDelete={handleBulkDelete}
          onApprove={() => handleBulkStatusChange("published")}
          onReject={() => handleBulkStatusChange("draft")}
          loading={loading}
        />
      )}

      {/* ─── Table ─── */}
      {loading && blogs.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-[var(--danger-color)]">
          Error: {error}
        </div>
      ) : (
        <BlogTable
          blogs={blogs}
          selectedBlogs={selectedBlogs}
          onToggleSelect={toggleBlogSelection}
          onToggleSelectAll={toggleSelectAll}
          onSort={handleSort}
          sortConfig={sortConfig}
          onView={(blog) => viewDialog.open(blog.id)}
          onEdit={formDialog.openEdit}
          onDelete={handleDelete}
          onToggleFeatured={handleToggleFeatured}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* ─── Empty State ─── */}
      {!loading && !error && blogs.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)] opacity-50" />
          <p className="text-base font-medium text-[var(--sidebar-text)]">
            No blog posts found.
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {hasFilters
              ? "Try adjusting your search or filters"
              : "Start by creating your first blog post"}
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
              Add First Blog
            </button>
          </div>
        </div>
      )}

      {/* ─── Dialogs ─── */}
      <BlogFormDialog
        isOpen={formDialog.isOpen}
        mode={formDialog.mode}
        blogId={formDialog.blogId}
        initialData={formDialog.initialData}
        onClose={formDialog.close}
        onSuccess={reload}
      />

      <BlogViewDialog
        isOpen={viewDialog.isOpen}
        blog={viewDialog.blog}
        comments={viewDialog.comments}
        loading={viewDialog.loading}
        loadingComments={viewDialog.loadingComments}
        onClose={viewDialog.close}
        onEdit={(blog) => {
          formDialog.openEdit(blog);
          viewDialog.close();
        }}
        onFetchComments={viewDialog.fetchComments}
      />
    </div>
  );
};

export default BlogsPage;