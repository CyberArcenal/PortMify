// src/pages/email-templates/components/EmailTemplateTable.tsx
import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { EmailTemplateWithDetails } from "../hooks/useEmailTemplates";
import { formatDate } from "@/utils/formatters";
import EmailTemplateActionsDropdown from "./EmailTemplateActionsDropdown";

interface EmailTemplateTableProps {
  templates: EmailTemplateWithDetails[];
  selectedTemplates: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (template: EmailTemplateWithDetails) => void;
  onEdit: (template: EmailTemplateWithDetails) => void;
  onDelete: (template: EmailTemplateWithDetails) => void;
}

const EmailTemplateTable: React.FC<EmailTemplateTableProps> = ({
  templates,
  selectedTemplates,
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

  const truncateText = (text: string, maxLength = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No email templates found.
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
                checked={templates.length > 0 && selectedTemplates.length === templates.length}
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
              onClick={() => onSort("subject")}
            >
              <div className="flex items-center gap-1">
                Subject {getSortIcon("subject")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden lg:table-cell"
              onClick={() => onSort("created_at")}
            >
              <div className="flex items-center gap-1">
                Created {getSortIcon("created_at")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden xl:table-cell"
              onClick={() => onSort("modified_at")}
            >
              <div className="flex items-center gap-1">
                Modified {getSortIcon("modified_at")}
              </div>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr
              key={template.id}
              className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors cursor-pointer"
              onClick={() => onView(template)}
            >
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedTemplates.includes(template.id)}
                  onChange={() => onToggleSelect(template.id)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] font-mono text-xs hidden sm:table-cell">
                {template.id}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium">
                {template.name}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] hidden md:table-cell">
                {truncateText(template.subject)}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden lg:table-cell">
                {formatDate(template.created_at)}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden xl:table-cell">
                {formatDate(template.modified_at)}
              </td>
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <EmailTemplateActionsDropdown
                  template={template}
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

export default EmailTemplateTable;