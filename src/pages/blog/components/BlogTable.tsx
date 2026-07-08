// src/pages/blog/components/BlogTable.tsx
import React from "react";
import { ChevronUp, ChevronDown, Star } from "lucide-react";
import type { BlogWithDetails } from "../hooks/useBlogs";
import BlogActionsDropdown from "./BlogActionsDropdown";
import { formatDate } from "../../../utils/formatters";

interface BlogTableProps {
  blogs: BlogWithDetails[];
  selectedBlogs: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (blog: BlogWithDetails) => void;
  onEdit: (blog: BlogWithDetails) => void;
  onDelete: (blog: BlogWithDetails) => void;
  onToggleFeatured?: (blog: BlogWithDetails) => void;
  onToggleStatus?: (blog: BlogWithDetails) => void;
}

const BlogTable: React.FC<BlogTableProps> = ({
  blogs,
  selectedBlogs,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  sortConfig,
  onView,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleStatus,
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  const getStatusBadge = (status: string) => {
    return status === "published"
      ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
      : "bg-[var(--status-inactive-bg)] text-[var(--status-inactive-text)]";
  };

  if (blogs.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No blog posts found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="py-3 px-4 w-8">
              <input
                type="checkbox"
                checked={blogs.length > 0 && selectedBlogs.length === blogs.length}
                onChange={onToggleSelectAll}
                className="rounded border-[var(--border-color)] cursor-pointer"
              />
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("title")}
            >
              <div className="flex items-center gap-1">
                Title {getSortIcon("title")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden md:table-cell"
              onClick={() => onSort("slug")}
            >
              <div className="flex items-center gap-1">
                Slug {getSortIcon("slug")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden lg:table-cell"
              onClick={() => onSort("author__name")}
            >
              <div className="flex items-center gap-1">
                Author {getSortIcon("author__name")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("status")}
            >
              <div className="flex items-center gap-1">
                Status {getSortIcon("status")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden sm:table-cell"
              onClick={() => onSort("featured")}
            >
              <div className="flex items-center gap-1">
                Featured {getSortIcon("featured")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden lg:table-cell"
              onClick={() => onSort("published_date")}
            >
              <div className="flex items-center gap-1">
                Published {getSortIcon("published_date")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden xl:table-cell"
              onClick={() => onSort("views")}
            >
              <div className="flex items-center gap-1">
                Views {getSortIcon("views")}
              </div>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {blogs.map((blog) => (
            <tr
              key={blog.id}
              className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors cursor-pointer"
              onClick={() => onView(blog)}
            >
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedBlogs.includes(blog.id)}
                  onChange={() => onToggleSelect(blog.id)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium">
                {blog.title}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] font-mono text-xs hidden md:table-cell">
                {blog.slug}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] hidden lg:table-cell">
                {blog.author?.name || "-"}
              </td>
              <td className="py-2.5 px-4">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(blog.status)}`}
                >
                  {blog.status_display}
                </span>
              </td>
              <td className="py-2.5 px-4 hidden sm:table-cell">
                {blog.featured ? (
                  <Star className="w-4 h-4 text-[var(--secondary-color)]" />
                ) : (
                  <span className="text-[var(--text-tertiary)]">—</span>
                )}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden lg:table-cell">
                {blog.published_date ? formatDate(blog.published_date) : "-"}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-right hidden xl:table-cell">
                {blog.views.toLocaleString()}
              </td>
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <BlogActionsDropdown
                  blog={blog}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleFeatured={onToggleFeatured}
                  onToggleStatus={onToggleStatus}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BlogTable;