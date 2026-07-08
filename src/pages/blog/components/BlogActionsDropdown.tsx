// src/pages/blog/components/BlogActionsDropdown.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Star,
  StarOff,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { dialogs } from "../../../utils/dialogs";
import type { BlogWithDetails } from "../hooks/useBlogs";

interface BlogActionsDropdownProps {
  blog: BlogWithDetails;
  onView: (blog: BlogWithDetails) => void;
  onEdit: (blog: BlogWithDetails) => void;
  onDelete: (blog: BlogWithDetails) => void;
  onToggleFeatured?: (blog: BlogWithDetails) => void;
  onToggleStatus?: (blog: BlogWithDetails) => void;
}

const BlogActionsDropdown: React.FC<BlogActionsDropdownProps> = ({
  blog,
  onView,
  onEdit,
  onDelete,
  onToggleFeatured,
  onToggleStatus,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = () => setIsOpen(!isOpen);
  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDropdownPosition = () => {
    if (!buttonRef.current) return {};
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = 260;
    const windowHeight = window.innerHeight;

    if (rect.bottom + dropdownHeight > windowHeight) {
      return {
        bottom: `${windowHeight - rect.top + 5}px`,
        right: `${window.innerWidth - rect.right}px`,
      };
    }
    return {
      top: `${rect.bottom + 5}px`,
      right: `${window.innerWidth - rect.right}px`,
    };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        className="p-1.5 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors"
        title="More Actions"
      >
        <MoreVertical className="w-4 h-4 text-[var(--text-secondary)]" />
      </button>

      {isOpen && (
        <div
          className="fixed rounded-xl shadow-lg border w-48 z-50 overflow-hidden"
          style={{
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--border-color)",
            boxShadow: "var(--shadow-lg)",
            ...getDropdownPosition(),
          }}
        >
          <div className="py-1">
            {/* View */}
            <button
              onClick={() => handleAction(() => onView(blog))}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
            >
              <Eye className="w-4 h-4 text-[var(--accent-blue)]" />
              <span>View Details</span>
            </button>

            {/* Edit */}
            <button
              onClick={() => handleAction(() => onEdit(blog))}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
            >
              <Edit className="w-4 h-4 text-[var(--secondary-color)]" />
              <span>Edit Blog</span>
            </button>

            {/* Toggle Status */}
            {blog.status === "published" ? (
              <button
                onClick={() => handleAction(() => onToggleStatus?.(blog))}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
              >
                <XCircle className="w-4 h-4 text-[var(--warning-color)]" />
                <span>Unpublish</span>
              </button>
            ) : (
              <button
                onClick={() => handleAction(() => onToggleStatus?.(blog))}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
              >
                <CheckCircle className="w-4 h-4 text-[var(--success-color)]" />
                <span>Publish</span>
              </button>
            )}

            {/* Toggle Featured */}
            {blog.featured ? (
              <button
                onClick={() => handleAction(() => onToggleFeatured?.(blog))}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
              >
                <StarOff className="w-4 h-4 text-[var(--warning-color)]" />
                <span>Remove Featured</span>
              </button>
            ) : (
              <button
                onClick={() => handleAction(() => onToggleFeatured?.(blog))}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
              >
                <Star className="w-4 h-4 text-[var(--secondary-color)]" />
                <span>Mark Featured</span>
              </button>
            )}

            <hr className="border-[var(--border-color)] mx-3" />

            {/* Delete */}
            <button
              onClick={() => handleAction(() => onDelete(blog))}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--danger-color)] hover:bg-[var(--danger-color)]/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Blog</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogActionsDropdown;