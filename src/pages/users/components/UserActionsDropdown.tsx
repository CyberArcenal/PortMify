// src/pages/users/components/UserActionsDropdown.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  Shield,
  ShieldOff,
  Crown,
  CirclePowerIcon,
} from "lucide-react";
import type { UserWithDetails } from "../hooks/useUsers";

interface UserActionsDropdownProps {
  user: UserWithDetails;
  onView: (user: UserWithDetails) => void;
  onEdit: (user: UserWithDetails) => void;
  onDelete: (user: UserWithDetails) => void;
  onToggleActive?: (user: UserWithDetails) => void;
  onToggleStaff?: (user: UserWithDetails) => void;
  onToggleSuperuser?: (user: UserWithDetails) => void;
}

const UserActionsDropdown: React.FC<UserActionsDropdownProps> = ({
  user,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleStaff,
  onToggleSuperuser,
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
    const dropdownHeight = 280;
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
              onClick={() => handleAction(() => onView(user))}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
            >
              <Eye className="w-4 h-4 text-[var(--accent-blue)]" />
              <span>View Details</span>
            </button>
            <button
              onClick={() => handleAction(() => onEdit(user))}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
            >
              <Edit className="w-4 h-4 text-[var(--secondary-color)]" />
              <span>Edit User</span>
            </button>

            {user.is_active ? (
              <button
                onClick={() => handleAction(() => onToggleActive?.(user))}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
              >
                <XCircle className="w-4 h-4 text-[var(--warning-color)]" />
                <span>Deactivate</span>
              </button>
            ) : (
              <button
                onClick={() => handleAction(() => onToggleActive?.(user))}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
              >
                <CheckCircle className="w-4 h-4 text-[var(--success-color)]" />
                <span>Activate</span>
              </button>
            )}

            {user.is_staff ? (
              <button
                onClick={() => handleAction(() => onToggleStaff?.(user))}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
              >
                <ShieldOff className="w-4 h-4 text-[var(--warning-color)]" />
                <span>Remove Staff</span>
              </button>
            ) : (
              <button
                onClick={() => handleAction(() => onToggleStaff?.(user))}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
              >
                <Shield className="w-4 h-4 text-[var(--success-color)]" />
                <span>Make Staff</span>
              </button>
            )}

            {user.is_superuser ? (
              <button
                onClick={() => handleAction(() => onToggleSuperuser?.(user))}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
              >
                <CirclePowerIcon className="w-4 h-4 text-[var(--warning-color)]" />
                <span>Remove Superuser</span>
              </button>
            ) : (
              <button
                onClick={() => handleAction(() => onToggleSuperuser?.(user))}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
              >
                <Crown className="w-4 h-4 text-[var(--success-color)]" />
                <span>Make Superuser</span>
              </button>
            )}

            <hr className="border-[var(--border-color)] mx-3" />

            <button
              onClick={() => handleAction(() => onDelete(user))}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--danger-color)] hover:bg-[var(--danger-color)]/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete User</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActionsDropdown;