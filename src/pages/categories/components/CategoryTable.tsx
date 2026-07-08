// src/pages/categories/components/CategoryTable.tsx
import React from "react";
import { ChevronUp, ChevronDown, Star } from "lucide-react";
import type { CategoryWithDetails } from "../hooks/useCategories";
import CategoryActionsDropdown from "./CategoryActionsDropdown";

interface CategoryTableProps {
  categories: CategoryWithDetails[];
  selectedCategories: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (category: CategoryWithDetails) => void;
  onEdit: (category: CategoryWithDetails) => void;
  onDelete: (category: CategoryWithDetails) => void;
  onToggleFeatured?: (category: CategoryWithDetails) => void;
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  selectedCategories,
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

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No categories found.
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
                  categories.length > 0 &&
                  selectedCategories.length === categories.length
                }
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
              onClick={() => onSort("slug")}
            >
              <div className="flex items-center gap-1">
                Slug {getSortIcon("slug")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] hidden lg:table-cell"
            >
              Description
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden sm:table-cell"
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
          {categories.map((category) => (
            <tr
              key={category.id}
              className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors cursor-pointer"
              onClick={() => onView(category)}
            >
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => onToggleSelect(category.id)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium">
                {category.name}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] font-mono text-xs hidden md:table-cell">
                {category.slug}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-sm hidden lg:table-cell">
                {category.description || "-"}
              </td>
              <td className="py-2.5 px-4 hidden sm:table-cell">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getFeaturedBadge(category.featured)}`}
                >
                  {category.featured ? (
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
                <CategoryActionsDropdown
                  category={category}
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

export default CategoryTable;