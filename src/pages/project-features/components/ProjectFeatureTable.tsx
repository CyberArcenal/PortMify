// src/pages/project-features/components/ProjectFeatureTable.tsx
import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { ProjectFeatureWithDetails } from "../hooks/useProjectFeatures";
import ProjectFeatureActionsDropdown from "./ProjectFeatureActionsDropdown";

interface ProjectFeatureTableProps {
  features: ProjectFeatureWithDetails[];
  selectedFeatures: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (feature: ProjectFeatureWithDetails) => void;
  onEdit: (feature: ProjectFeatureWithDetails) => void;
  onDelete: (feature: ProjectFeatureWithDetails) => void;
}

const ProjectFeatureTable: React.FC<ProjectFeatureTableProps> = ({
  features,
  selectedFeatures,
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

  const truncateDescription = (desc: string, maxLength = 60) => {
    if (desc.length <= maxLength) return desc;
    return desc.substring(0, maxLength) + "...";
  };

  if (features.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No features found for this project.
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
                checked={features.length > 0 && selectedFeatures.length === features.length}
                onChange={onToggleSelectAll}
                className="rounded border-[var(--border-color)] cursor-pointer"
              />
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden sm:table-cell"
              onClick={() => onSort("order")}
            >
              <div className="flex items-center gap-1">
                Order {getSortIcon("order")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("description")}
            >
              <div className="flex items-center gap-1">
                Description {getSortIcon("description")}
              </div>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {features.map((feature) => (
            <tr
              key={feature.id}
              className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors cursor-pointer"
              onClick={() => onView(feature)}
            >
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedFeatures.includes(feature.id)}
                  onChange={() => onToggleSelect(feature.id)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden sm:table-cell">
                {feature.order}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-primary)] max-w-[300px]">
                {truncateDescription(feature.description)}
              </td>
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <ProjectFeatureActionsDropdown
                  feature={feature}
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

export default ProjectFeatureTable;