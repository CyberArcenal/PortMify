// src/pages/notifyLog/components/NotifyFilterPanel.tsx
import React from "react";
import { X } from "lucide-react";

interface NotificationFilterPanelProps {
  filters: {
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  };
  onChange: (filters: any) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const NotificationFilterPanel: React.FC<NotificationFilterPanelProps> = ({
  filters,
  onChange,
  onClear,
  isOpen,
  onToggle,
}) => {
  const updateFilter = (key: string, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const hasFilters = filters.status || filters.startDate || filters.endDate;

  if (!isOpen) return null;

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
            onClick={onClear}
            className="text-xs text-[var(--primary-color)] hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            Status
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) => updateFilter("status", e.target.value || undefined)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--input-text)",
            }}
          >
            <option value="">All statuses</option>
            <option value="queued">Queued</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="resend">Resend</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            From Date
          </label>
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => updateFilter("startDate", e.target.value || undefined)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--input-text)",
            }}
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            To Date
          </label>
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => updateFilter("endDate", e.target.value || undefined)}
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--input-border)",
              color: "var(--input-text)",
            }}
          />
        </div>

        {/* Sort Options */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
            Sort By
          </label>
          <div className="flex gap-2">
            <select
              value={filters.sortBy || "created_at"}
              onChange={(e) => updateFilter("sortBy", e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--input-text)",
              }}
            >
              <option value="created_at">Created</option>
              <option value="sent_at">Sent At</option>
              <option value="recipient_email">Recipient</option>
              <option value="status">Status</option>
            </select>
            <select
              value={filters.sortOrder || "DESC"}
              onChange={(e) => updateFilter("sortOrder", e.target.value as "ASC" | "DESC")}
              className="w-24 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: "var(--input-border)",
                color: "var(--input-text)",
              }}
            >
              <option value="ASC">↑</option>
              <option value="DESC">↓</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};