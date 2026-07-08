// src/pages/contact-messages/components/ContactMessageTable.tsx
import React from "react";
import { ChevronUp, ChevronDown, CheckCircle, XCircle } from "lucide-react";
import type { ContactMessageWithDetails } from "../hooks/useContactMessages";
import { formatDate } from "@/utils/formatters";
import ContactMessageActionsDropdown from "./ContactMessageActionsDropdown";

interface ContactMessageTableProps {
  messages: ContactMessageWithDetails[];
  selectedMessages: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (message: ContactMessageWithDetails) => void;
  onDelete: (message: ContactMessageWithDetails) => void;
  onToggleRead?: (message: ContactMessageWithDetails) => void;
}

const ContactMessageTable: React.FC<ContactMessageTableProps> = ({
  messages,
  selectedMessages,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  sortConfig,
  onView,
  onDelete,
  onToggleRead,
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  const getReadBadge = (isRead: boolean) => {
    return isRead
      ? "bg-[var(--status-success-bg)] text-[var(--status-success-text)]"
      : "bg-[var(--status-inactive-bg)] text-[var(--status-inactive-text)]";
  };

  const truncateSubject = (subject: string, maxLength = 30) => {
    if (subject.length <= maxLength) return subject;
    return subject.substring(0, maxLength) + "...";
  };

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No messages found.
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
                checked={messages.length > 0 && selectedMessages.length === messages.length}
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
              onClick={() => onSort("name")}
            >
              <div className="flex items-center gap-1">
                Name {getSortIcon("name")}
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
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("subject")}
            >
              <div className="flex items-center gap-1">
                Subject {getSortIcon("subject")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden sm:table-cell"
              onClick={() => onSort("is_read")}
            >
              <div className="flex items-center gap-1">
                Status {getSortIcon("is_read")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden xl:table-cell"
              onClick={() => onSort("created_at")}
            >
              <div className="flex items-center gap-1">
                Received {getSortIcon("created_at")}
              </div>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message) => (
            <tr
              key={message.id}
              className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors cursor-pointer"
              onClick={() => onView(message)}
            >
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedMessages.includes(message.id)}
                  onChange={() => onToggleSelect(message.id)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] font-mono text-xs hidden sm:table-cell">
                {message.id}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium">
                {message.name}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-sm hidden md:table-cell">
                {message.email}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] max-w-[150px] truncate">
                {truncateSubject(message.subject)}
              </td>
              <td className="py-2.5 px-4 hidden sm:table-cell">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getReadBadge(message.is_read)}`}
                >
                  {message.is_read ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Read
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Unread
                    </>
                  )}
                </span>
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden xl:table-cell">
                {formatDate(message.created_at)}
              </td>
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <ContactMessageActionsDropdown
                  message={message}
                  onView={onView}
                  onDelete={onDelete}
                  onToggleRead={onToggleRead}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactMessageTable;