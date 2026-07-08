// src/pages/users/components/UserTable.tsx
import React from "react";
import { ChevronUp, ChevronDown, CheckCircle, XCircle, Shield, Crown } from "lucide-react";
import type { UserWithDetails } from "../hooks/useUsers";
import { formatDate } from "@/utils/formatters";
import UserActionsDropdown from "./UserActionsDropdown";

interface UserTableProps {
  users: UserWithDetails[];
  selectedUsers: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (user: UserWithDetails) => void;
  onEdit: (user: UserWithDetails) => void;
  onDelete: (user: UserWithDetails) => void;
  onToggleActive?: (user: UserWithDetails) => void;
  onToggleStaff?: (user: UserWithDetails) => void;
  onToggleSuperuser?: (user: UserWithDetails) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  selectedUsers,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  sortConfig,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleStaff,
  onToggleSuperuser,
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  const getActiveBadge = (isActive: boolean) => {
    return isActive
      ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
      : "bg-[var(--status-inactive-bg)] text-[var(--status-inactive-text)]";
  };

  const getStaffBadge = (isStaff: boolean) => {
    return isStaff
      ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
      : "bg-[var(--status-inactive-bg)] text-[var(--status-inactive-text)]";
  };

  const getSuperuserBadge = (isSuperuser: boolean) => {
    return isSuperuser
      ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
      : "bg-[var(--status-inactive-bg)] text-[var(--status-inactive-text)]";
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No users found.
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
                checked={users.length > 0 && selectedUsers.length === users.length}
                onChange={onToggleSelectAll}
                className="rounded border-[var(--border-color)] cursor-pointer"
              />
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("username")}
            >
              <div className="flex items-center gap-1">
                Username {getSortIcon("username")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden md:table-cell"
              onClick={() => onSort("email")}
            >
              <div className="flex items-center gap-1">
                Email {getSortIcon("email")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] hidden lg:table-cell"
            >
              Full Name
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden xl:table-cell"
              onClick={() => onSort("user_type")}
            >
              <div className="flex items-center gap-1">
                User Type {getSortIcon("user_type")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden sm:table-cell"
              onClick={() => onSort("is_active")}
            >
              <div className="flex items-center gap-1">
                Active {getSortIcon("is_active")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] hidden 2xl:table-cell"
              onClick={() => onSort("is_staff")}
            >
              <div className="flex items-center gap-1">
                Staff {getSortIcon("is_staff")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] hidden 2xl:table-cell"
              onClick={() => onSort("is_superuser")}
            >
              <div className="flex items-center gap-1">
                Superuser {getSortIcon("is_superuser")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden 3xl:table-cell"
              onClick={() => onSort("date_joined")}
            >
              <div className="flex items-center gap-1">
                Joined {getSortIcon("date_joined")}
              </div>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors cursor-pointer"
              onClick={() => onView(user)}
            >
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => onToggleSelect(user.id)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium">
                {user.username}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden md:table-cell">
                {user.email}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden lg:table-cell">
                {user.full_name}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden xl:table-cell">
                {user.user_type_display}
              </td>
              <td className="py-2.5 px-4 hidden sm:table-cell">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getActiveBadge(user.is_active)}`}
                >
                  {user.is_active ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Inactive
                    </>
                  )}
                </span>
              </td>
              <td className="py-2.5 px-4 hidden 2xl:table-cell">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getStaffBadge(user.is_staff)}`}
                >
                  {user.is_staff ? (
                    <>
                      <Shield className="w-3 h-3 mr-1" />
                      Staff
                    </>
                  ) : (
                    "User"
                  )}
                </span>
              </td>
              <td className="py-2.5 px-4 hidden 2xl:table-cell">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${getSuperuserBadge(user.is_superuser)}`}
                >
                  {user.is_superuser ? (
                    <>
                      <Crown className="w-3 h-3 mr-1" />
                      Superuser
                    </>
                  ) : (
                    "No"
                  )}
                </span>
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden 3xl:table-cell">
                {formatDate(user.date_joined)}
              </td>
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <UserActionsDropdown
                  user={user}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleActive={onToggleActive}
                  onToggleStaff={onToggleStaff}
                  onToggleSuperuser={onToggleSuperuser}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;