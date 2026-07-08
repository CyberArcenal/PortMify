// src/pages/comments/components/FilterBar.tsx
import React from "react";
import { X } from "lucide-react";
import type { CommentFilters } from "../hooks/useComments";

interface FilterBarProps {
  filters: CommentFilters;
  onFilterChange: (key: keyof CommentFilters, value: string) => void;
  onReset: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const hasFilters = Object.values(filters).some((v) => v);

  return (
    <div className="bg-[var(--card-secondary-bg)] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
          <span>Filters</span>
          {hasFilters && (
            <span className="text-xs text-[var(--primary-color)] bg-[var(--primary-color)]/10 px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>
        {hasFilters && (
          <button
            onClick={onReset}
            className="text-xs text-[var(--primary-color)] hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by content..."
            value={filters.search}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--input-text)",
            }}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            Status
          </label>
          <select
            value={filters.approved}
            onChange={(e) => onFilterChange("approved", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--input-text)",
            }}
          >
            <option value="">All</option>
            <option value="true">Approved</option>
            <option value="false">Pending</option>
          </select>
        </div>

        {/* Content Type */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            Content Type
          </label>
          <select
            value={filters.content_type}
            onChange={(e) => onFilterChange("content_type", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--input-text)",
            }}
          >
            <option value="">All</option>
            <option value="blog">Blog</option>
            <option value="project">Project</option>
          </select>
        </div>

        {/* Object ID */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            Object ID
          </label>
          <input
            type="number"
            placeholder="e.g., 123"
            value={filters.object_id}
            onChange={(e) => onFilterChange("object_id", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--input-text)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterBar;