// src/pages/experience/components/ExperienceTable.tsx
import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { ExperienceWithDetails } from "../hooks/useExperience";
import { formatDate } from "@/utils/formatters";
import ExperienceActionsDropdown from "./ExperienceActionsDropdown";

interface ExperienceTableProps {
  experiences: ExperienceWithDetails[];
  selectedExperiences: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (experience: ExperienceWithDetails) => void;
  onEdit: (experience: ExperienceWithDetails) => void;
  onDelete: (experience: ExperienceWithDetails) => void;
}

const ExperienceTable: React.FC<ExperienceTableProps> = ({
  experiences,
  selectedExperiences,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  sortConfig,
  onView,
  onEdit,
  onDelete,
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  const getCurrentBadge = (current: boolean) => {
    return current
      ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
      : "bg-[var(--status-inactive-bg)] text-[var(--status-inactive-text)]";
  };

  if (experiences.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No experience records found.
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
                checked={experiences.length > 0 && selectedExperiences.length === experiences.length}
                onChange={onToggleSelectAll}
                className="rounded border-[var(--border-color)] cursor-pointer"
              />
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("company")}
            >
              <div className="flex items-center gap-1">
                Company {getSortIcon("company")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden sm:table-cell"
              onClick={() => onSort("position")}
            >
              <div className="flex items-center gap-1">
                Position {getSortIcon("position")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden md:table-cell"
              onClick={() => onSort("start_date")}
            >
              <div className="flex items-center gap-1">
                Start Date {getSortIcon("start_date")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden lg:table-cell"
              onClick={() => onSort("end_date")}
            >
              <div className="flex items-center gap-1">
                End Date {getSortIcon("end_date")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden sm:table-cell"
              onClick={() => onSort("current")}
            >
              <div className="flex items-center gap-1">
                Status {getSortIcon("current")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden xl:table-cell"
              onClick={() => onSort("order")}
            >
              <div className="flex items-center gap-1">
                Order {getSortIcon("order")}
              </div>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {experiences.map((item) => (
            <tr
              key={item.id}
              className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors cursor-pointer"
              onClick={() => onView(item)}
            >
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedExperiences.includes(item.id)}
                  onChange={() => onToggleSelect(item.id)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium">
                {item.company}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] hidden sm:table-cell">
                {item.position}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-sm hidden md:table-cell">
                {formatDate(item.start_date)}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-sm hidden lg:table-cell">
                {item.current ? "Present" : (item.end_date ? formatDate(item.end_date) : "-")}
              </td>
              <td className="py-2.5 px-4 hidden sm:table-cell">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getCurrentBadge(item.current)}`}
                >
                  {item.current ? "Current" : "Past"}
                </span>
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-sm hidden xl:table-cell">
                {item.order}
              </td>
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <ExperienceActionsDropdown
                  experience={item}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExperienceTable;