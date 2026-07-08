// src/pages/education/components/EducationTable.tsx
import React from "react";
import { ChevronUp, ChevronDown, Calendar } from "lucide-react";
import type { EducationWithDetails } from "../hooks/useEducation";
import { formatDate } from "@/utils/formatters";
import EducationActionsDropdown from "./EducationActionsDropdown";

interface EducationTableProps {
  education: EducationWithDetails[];
  selectedEducation: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (education: EducationWithDetails) => void;
  onEdit: (education: EducationWithDetails) => void;
  onDelete: (education: EducationWithDetails) => void;
}

const EducationTable: React.FC<EducationTableProps> = ({
  education,
  selectedEducation,
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

  if (education.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No education records found.
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
                checked={
                  education.length > 0 &&
                  selectedEducation.length === education.length
                }
                onChange={onToggleSelectAll}
                className="rounded border-[var(--border-color)] cursor-pointer"
              />
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("institution")}
            >
              <div className="flex items-center gap-1">
                Institution {getSortIcon("institution")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden md:table-cell"
              onClick={() => onSort("degree")}
            >
              <div className="flex items-center gap-1">
                Degree {getSortIcon("degree")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] hidden lg:table-cell"
            >
              Field of Study
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden sm:table-cell"
              onClick={() => onSort("start_date")}
            >
              <div className="flex items-center gap-1">
                Start {getSortIcon("start_date")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] hidden xl:table-cell"
            >
              End Date
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden sm:table-cell"
              onClick={() => onSort("current")}
            >
              <div className="flex items-center gap-1">
                Status {getSortIcon("current")}
              </div>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {education.map((item) => (
            <tr
              key={item.id}
              className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors cursor-pointer"
              onClick={() => onView(item)}
            >
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedEducation.includes(item.id)}
                  onChange={() => onToggleSelect(item.id)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium">
                {item.institution}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] hidden md:table-cell">
                {item.degree}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-sm hidden lg:table-cell">
                {item.field_of_study}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden sm:table-cell">
                {formatDate(item.start_date)}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden xl:table-cell">
                {item.current ? "Present" : item.end_date ? formatDate(item.end_date) : "-"}
              </td>
              <td className="py-2.5 px-4 hidden sm:table-cell">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getCurrentBadge(item.current)}`}
                >
                  {item.current ? "Current" : "Completed"}
                </span>
              </td>
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <EducationActionsDropdown
                  education={item}
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

export default EducationTable;