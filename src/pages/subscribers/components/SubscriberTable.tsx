// src/pages/subscribers/components/SubscriberTable.tsx
import React from "react";
import { ChevronUp, ChevronDown, CheckCircle, XCircle } from "lucide-react";
import type { SubscriberWithDetails } from "../hooks/useSubscribers";
import { formatDate } from "@/utils/formatters";
import SubscriberActionsDropdown from "./SubscriberActionsDropdown";

interface SubscriberTableProps {
  subscribers: SubscriberWithDetails[];
  selectedSubscribers: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (subscriber: SubscriberWithDetails) => void;
  onDelete: (subscriber: SubscriberWithDetails) => void;
  onToggleActive?: (subscriber: SubscriberWithDetails) => void;
  onToggleConfirmed?: (subscriber: SubscriberWithDetails) => void;
}

const SubscriberTable: React.FC<SubscriberTableProps> = ({
  subscribers,
  selectedSubscribers,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  sortConfig,
  onView,
  onDelete,
  onToggleActive,
  onToggleConfirmed,
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  const getActiveBadge = (isActive: boolean) => {
    return isActive
      ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
      : "bg-[var(--status-inactive-bg)] text-[var(--status-inactive-text)]";
  };

  const getConfirmedBadge = (confirmed: boolean) => {
    return confirmed
      ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
      : "bg-[var(--status-inactive-bg)] text-[var(--status-inactive-text)]";
  };

  if (subscribers.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No subscribers found.
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
                checked={subscribers.length > 0 && selectedSubscribers.length === subscribers.length}
                onChange={onToggleSelectAll}
                className="rounded border-[var(--border-color)] cursor-pointer"
              />
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("email")}
            >
              <div className="flex items-center gap-1">
                Email {getSortIcon("email")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden md:table-cell"
              onClick={() => onSort("subscribed_at")}
            >
              <div className="flex items-center gap-1">
                Subscribed {getSortIcon("subscribed_at")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden sm:table-cell"
              onClick={() => onSort("is_active")}
            >
              <div className="flex items-center gap-1">
                Status {getSortIcon("is_active")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden lg:table-cell"
              onClick={() => onSort("confirmed")}
            >
              <div className="flex items-center gap-1">
                Confirmed {getSortIcon("confirmed")}
              </div>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((sub) => (
            <tr
              key={sub.id}
              className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors cursor-pointer"
              onClick={() => onView(sub)}
            >
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedSubscribers.includes(sub.id)}
                  onChange={() => onToggleSelect(sub.id)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium">
                {sub.email}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden md:table-cell">
                {formatDate(sub.subscribed_at)}
              </td>
              <td className="py-2.5 px-4 hidden sm:table-cell">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getActiveBadge(sub.is_active)}`}
                >
                  {sub.is_active ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                  )}
                </span>
              </td>
              <td className="py-2.5 px-4 hidden lg:table-cell">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getConfirmedBadge(sub.confirmed)}`}
                >
                  {sub.confirmed ? "Confirmed" : "Unconfirmed"}
                </span>
              </td>
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <SubscriberActionsDropdown
                  subscriber={sub}
                  onView={onView}
                  onDelete={onDelete}
                  onToggleActive={onToggleActive}
                  onToggleConfirmed={onToggleConfirmed}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubscriberTable;