// src/pages/project-techstacks/components/ProjectTechStackTable.tsx
import React from "react";
import { ChevronUp, ChevronDown, Cpu } from "lucide-react";
import type { ProjectTechStackWithDetails } from "../hooks/useProjectTechStacks";
import ProjectTechStackActionsDropdown from "./ProjectTechStackActionsDropdown";

interface ProjectTechStackTableProps {
  items: ProjectTechStackWithDetails[];
  selectedItems: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (item: ProjectTechStackWithDetails) => void;
  onEdit: (item: ProjectTechStackWithDetails) => void;
  onDelete: (item: ProjectTechStackWithDetails) => void;
}

const ProjectTechStackTable: React.FC<ProjectTechStackTableProps> = ({
  items,
  selectedItems,
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      frontend: "bg-[var(--accent-blue-light)] text-[var(--accent-blue)]",
      backend: "bg-[var(--accent-green-light)] text-[var(--accent-green)]",
      database: "bg-[var(--accent-purple-light)] text-[var(--accent-purple)]",
      devops: "bg-[var(--accent-orange-light)] text-[var(--accent-orange)]",
      other: "bg-[var(--status-inactive-bg)] text-[var(--status-inactive-text)]",
    };
    return colors[category] || colors.other;
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No tech stack items found for this project.
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
                checked={items.length > 0 && selectedItems.length === items.length}
                onChange={onToggleSelectAll}
                className="rounded border-[var(--border-color)] cursor-pointer"
              />
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("name")}
            >
              <div className="flex items-center gap-1">
                Name {getSortIcon("name")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden md:table-cell"
              onClick={() => onSort("category")}
            >
              <div className="flex items-center gap-1">
                Category {getSortIcon("category")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden sm:table-cell"
              onClick={() => onSort("order")}
            >
              <div className="flex items-center gap-1">
                Order {getSortIcon("order")}
              </div>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] hidden lg:table-cell">
              Icon
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors cursor-pointer"
              onClick={() => onView(item)}
            >
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => onToggleSelect(item.id)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium">
                {item.name}
              </td>
              <td className="py-2.5 px-4 hidden md:table-cell">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden sm:table-cell">
                {item.order}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs font-mono hidden lg:table-cell">
                {item.icon || <Cpu className="w-4 h-4" />}
              </td>
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <ProjectTechStackActionsDropdown
                  item={item}
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

export default ProjectTechStackTable;