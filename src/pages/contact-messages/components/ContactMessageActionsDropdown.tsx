// src/pages/contact-messages/components/ContactMessageActionsDropdown.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  Eye,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { ContactMessageWithDetails } from "../hooks/useContactMessages";

interface ContactMessageActionsDropdownProps {
  message: ContactMessageWithDetails;
  onView: (message: ContactMessageWithDetails) => void;
  onDelete: (message: ContactMessageWithDetails) => void;
  onToggleRead?: (message: ContactMessageWithDetails) => void;
}

const ContactMessageActionsDropdown: React.FC<ContactMessageActionsDropdownProps> = ({
  message,
  onView,
  onDelete,
  onToggleRead,
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
    const dropdownHeight = 180;
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
            <button
              onClick={() => handleAction(() => onView(message))}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
            >
              <Eye className="w-4 h-4 text-[var(--accent-blue)]" />
              <span>View Details</span>
            </button>
            {message.is_read ? (
              <button
                onClick={() => handleAction(() => onToggleRead?.(message))}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
              >
                <XCircle className="w-4 h-4 text-[var(--warning-color)]" />
                <span>Mark Unread</span>
              </button>
            ) : (
              <button
                onClick={() => handleAction(() => onToggleRead?.(message))}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
              >
                <CheckCircle className="w-4 h-4 text-[var(--success-color)]" />
                <span>Mark Read</span>
              </button>
            )}
            <hr className="border-[var(--border-color)] mx-3" />
            <button
              onClick={() => handleAction(() => onDelete(message))}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--danger-color)] hover:bg-[var(--danger-color)]/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Message</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessageActionsDropdown;