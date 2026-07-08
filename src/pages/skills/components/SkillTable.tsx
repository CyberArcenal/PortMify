// src/pages/skills/components/SkillTable.tsx
import React from "react";
import { ChevronUp, ChevronDown, Star } from "lucide-react";
import type { SkillWithDetails } from "../hooks/useSkills";
import SkillActionsDropdown from "./SkillActionsDropdown";

interface SkillTableProps {
  skills: SkillWithDetails[];
  selectedSkills: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (skill: SkillWithDetails) => void;
  onEdit: (skill: SkillWithDetails) => void;
  onDelete: (skill: SkillWithDetails) => void;
  onToggleFeatured?: (skill: SkillWithDetails) => void;
}

const SkillTable: React.FC<SkillTableProps> = ({
  skills,
  selectedSkills,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  sortConfig,
  onView,
  onEdit,
  onDelete,
  onToggleFeatured,
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  const getFeaturedBadge = (featured: boolean) => {
    return featured
      ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
      : "bg-[var(--status-inactive-bg)] text-[var(--status-inactive-text)]";
  };

  if (skills.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No skills found.
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
                checked={skills.length > 0 && selectedSkills.length === skills.length}
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
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden lg:table-cell"
              onClick={() => onSort("proficiency")}
            >
              <div className="flex items-center gap-1">
                Proficiency {getSortIcon("proficiency")}
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
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden xl:table-cell"
              onClick={() => onSort("featured")}
            >
              <div className="flex items-center gap-1">
                Featured {getSortIcon("featured")}
              </div>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill) => (
            <tr
              key={skill.id}
              className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors cursor-pointer"
              onClick={() => onView(skill)}
            >
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedSkills.includes(skill.id)}
                  onChange={() => onToggleSelect(skill.id)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium">
                {skill.name}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] hidden md:table-cell">
                {skill.category_display || skill.category}
              </td>
              <td className="py-2.5 px-4 hidden lg:table-cell">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-secondary)] text-xs font-medium w-10">
                    {skill.proficiency}%
                  </span>
                  <div className="w-20 h-1.5 bg-[var(--card-secondary-bg)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--primary-color)] transition-all"
                      style={{ width: `${skill.proficiency}%` }}
                    />
                  </div>
                </div>
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden sm:table-cell">
                {skill.order}
              </td>
              <td className="py-2.5 px-4 hidden xl:table-cell">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getFeaturedBadge(skill.featured)}`}
                >
                  {skill.featured ? (
                    <>
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </>
                  ) : (
                    "Not Featured"
                  )}
                </span>
              </td>
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <SkillActionsDropdown
                  skill={skill}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleFeatured={onToggleFeatured}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkillTable;