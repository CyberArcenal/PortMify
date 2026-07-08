// src/pages/comments/components/CommentTable.tsx
import React from "react";
import { ChevronUp, ChevronDown, CheckCircle, XCircle } from "lucide-react";
import type { CommentWithDetails } from "../hooks/useComments";
import { formatDate } from "@/utils/formatters";
import CommentActionsDropdown from "./CommentActionsDropdown";

interface CommentTableProps {
  comments: CommentWithDetails[];
  selectedComments: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (comment: CommentWithDetails) => void;
  onEdit: (comment: CommentWithDetails) => void;
  onDelete: (comment: CommentWithDetails) => void;
  onToggleApproved?: (comment: CommentWithDetails) => void;
}

const CommentTable: React.FC<CommentTableProps> = ({
  comments,
  selectedComments,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  sortConfig,
  onView,
  onEdit,
  onDelete,
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

  const getApprovedBadge = (approved: boolean) => {
    return approved
      ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
      : "bg-[var(--status-inactive-bg)] text-[var(--status-inactive-text)]";
  };

  const truncateContent = (content: string, maxLength = 60) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No comments found.
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
                checked={comments.length > 0 && selectedComments.length === comments.length}
                onChange={onToggleSelectAll}
                className="rounded border-[var(--border-color)] cursor-pointer"
              />
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden sm:table-cell"
              onClick={() => onSort("id")}
            >
              <div className="flex items-center gap-1">
                ID {getSortIcon("id")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("author__name")}
            >
              <div className="flex items-center gap-1">
                Author {getSortIcon("author__name")}
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
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] hidden lg:table-cell"
            >
              Related To
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden sm:table-cell"
              onClick={() => onSort("approved")}
            >
              <div className="flex items-center gap-1">
                Status {getSortIcon("approved")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden xl:table-cell"
              onClick={() => onSort("created_at")}
            >
              <div className="flex items-center gap-1">
                Created {getSortIcon("created_at")}
              </div>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment) => (
            <tr
              key={comment.id}
              className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors cursor-pointer"
              onClick={() => onView(comment)}
            >
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedComments.includes(comment.id)}
                  onChange={() => onToggleSelect(comment.id)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] font-mono text-xs hidden sm:table-cell">
                {comment.id}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium">
                {comment.author?.name || "Anonymous"}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] max-w-[200px] truncate">
                {truncateContent(comment.content)}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden lg:table-cell">
                {comment.content_object ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-[var(--card-secondary-bg)]">
                      {comment.content_object.type}
                    </span>
                    #{comment.content_object.id}
                  </span>
                ) : (
                  "-"
                )}
              </td>
              <td className="py-2.5 px-4 hidden sm:table-cell">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getApprovedBadge(comment.approved)}`}
                >
                  {comment.approved ? (
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
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden xl:table-cell">
                {formatDate(comment.created_at)}
              </td>
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <CommentActionsDropdown
                  comment={comment}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
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

export default CommentTable;