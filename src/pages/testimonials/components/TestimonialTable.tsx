// src/pages/testimonials/components/TestimonialTable.tsx
import React from "react";
import { ChevronUp, ChevronDown, Star, CheckCircle, XCircle } from "lucide-react";
import type { TestimonialWithDetails } from "../hooks/useTestimonials";
import { formatDate } from "@/utils/formatters";
import TestimonialActionsDropdown from "./TestimonialActionsDropdown";

interface TestimonialTableProps {
  testimonials: TestimonialWithDetails[];
  selectedTestimonials: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (testimonial: TestimonialWithDetails) => void;
  onEdit: (testimonial: TestimonialWithDetails) => void;
  onDelete: (testimonial: TestimonialWithDetails) => void;
  onToggleFeatured?: (testimonial: TestimonialWithDetails) => void;
  onToggleApproved?: (testimonial: TestimonialWithDetails) => void;
}

const TestimonialTable: React.FC<TestimonialTableProps> = ({
  testimonials,
  selectedTestimonials,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  sortConfig,
  onView,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleApproved,
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

  const getApprovedBadge = (approved: boolean) => {
    return approved
      ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
      : "bg-[var(--status-inactive-bg)] text-[var(--status-inactive-text)]";
  };

  const truncateContent = (content: string, maxLength = 60) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No testimonials found.
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
                checked={testimonials.length > 0 && selectedTestimonials.length === testimonials.length}
                onChange={onToggleSelectAll}
                className="rounded border-[var(--border-color)] cursor-pointer"
              />
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("author")}
            >
              <div className="flex items-center gap-1">
                Author {getSortIcon("author")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden md:table-cell"
              onClick={() => onSort("author_title")}
            >
              <div className="flex items-center gap-1">
                Title {getSortIcon("author_title")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("content")}
            >
              <div className="flex items-center gap-1">
                Content {getSortIcon("content")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden sm:table-cell"
              onClick={() => onSort("rating")}
            >
              <div className="flex items-center gap-1">
                Rating {getSortIcon("rating")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden lg:table-cell"
              onClick={() => onSort("featured")}
            >
              <div className="flex items-center gap-1">
                Featured {getSortIcon("featured")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden xl:table-cell"
              onClick={() => onSort("approved")}
            >
              <div className="flex items-center gap-1">
                Approved {getSortIcon("approved")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden 2xl:table-cell"
              onClick={() => onSort("created_at")}
            >
              <div className="flex items-center gap-1">
                Date {getSortIcon("created_at")}
              </div>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {testimonials.map((testimonial) => (
            <tr
              key={testimonial.id}
              className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors cursor-pointer"
              onClick={() => onView(testimonial)}
            >
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedTestimonials.includes(testimonial.id)}
                  onChange={() => onToggleSelect(testimonial.id)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium">
                {testimonial.author}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] hidden md:table-cell">
                {testimonial.author_title}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] max-w-[200px] truncate">
                {truncateContent(testimonial.content)}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-sm hidden sm:table-cell">
                {testimonial.rating} / 5
              </td>
              <td className="py-2.5 px-4 hidden lg:table-cell">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getFeaturedBadge(testimonial.featured)}`}
                >
                  {testimonial.featured ? "Featured" : "Not Featured"}
                </span>
              </td>
              <td className="py-2.5 px-4 hidden xl:table-cell">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getApprovedBadge(testimonial.approved)}`}
                >
                  {testimonial.approved ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Pending
                    </>
                  )}
                </span>
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden 2xl:table-cell">
                {formatDate(testimonial.created_at)}
              </td>
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <TestimonialActionsDropdown
                  testimonial={testimonial}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleFeatured={onToggleFeatured}
                  onToggleApproved={onToggleApproved}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TestimonialTable;