// src/pages/notifyLog/components/NotifyTable.tsx
import React from "react";
import {
  Eye,
  RefreshCw,
  Send,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  RotateCw,
  Mail,
  Loader2,
} from "lucide-react";
import { formatDate } from "../../../utils/formatters";
import type { NotifyLog } from "@/api/core/notifyLog";

interface NotificationTableProps {
  logs: NotifyLog[];
  onView: (log: NotifyLog) => void;
  onRetry: (id: number) => void;
  onResend: (id: number) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
  sendingIds?: Set<number>;
}

export const NotificationTable: React.FC<NotificationTableProps> = ({
  logs,
  onView,
  onRetry,
  onResend,
  onDelete,
  isLoading,
  sendingIds = new Set(),
}) => {
  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium gap-1";
    switch (status) {
      case "sent":
        return `${baseClasses} bg-[var(--status-success-bg)] text-[var(--status-success-text)]`;
      case "queued":
        return `${baseClasses} bg-[var(--status-inactive-bg)] text-[var(--status-inactive-text)]`;
      case "failed":
        return `${baseClasses} bg-[var(--danger-color)]/20 text-[var(--danger-color)]`;
      case "resend":
        return `${baseClasses} bg-[var(--status-success-bg)] text-[var(--status-success-text)]`;
      default:
        return `${baseClasses} bg-[var(--status-inactive-bg)] text-[var(--status-inactive-text)]`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent" />
      </div>
    );
  }

  if (logs?.length === 0) {
    return (
      <div className="text-center py-12 border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
        <Mail className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)] opacity-50" />
        <p className="text-base font-medium text-[var(--sidebar-text)]">No notifications found</p>
        <p className="text-sm text-[var(--text-secondary)]">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] hidden sm:table-cell">
              ID
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Recipient
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] hidden md:table-cell">
              Subject
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Status
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] hidden lg:table-cell">
              Retries
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] hidden xl:table-cell">
              Sent At
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] hidden 2xl:table-cell">
              Created
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-color)]">
          {logs?.map((log) => {
            const isSending = sendingIds.has(log.id);
            return (
              <tr
                key={log.id}
                className="hover:bg-[var(--card-hover-bg)] transition-colors cursor-pointer"
                onClick={() => onView(log)}
              >
                <td className="py-2.5 px-4 text-[var(--text-secondary)] font-mono text-xs hidden sm:table-cell">
                  #{log.id}
                </td>
                <td className="py-2.5 px-4 text-[var(--text-primary)] truncate max-w-[150px]">
                  {log.recipient_email}
                </td>
                <td className="py-2.5 px-4 text-[var(--text-secondary)] truncate max-w-[150px] hidden md:table-cell">
                  {log.subject || "—"}
                </td>
                <td className="py-2.5 px-4">
                  <span className={getStatusBadge(log.status)}>
                    {log.status === "resend" && <RotateCw className="w-3 h-3" />}
                    {log.status === "sent" && <CheckCircle className="w-3 h-3" />}
                    {log.status === "queued" && <Clock className="w-3 h-3" />}
                    {log.status === "failed" && <XCircle className="w-3 h-3" />}
                    {log.status}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-[var(--text-secondary)] hidden lg:table-cell">
                  {log.retry_count} / {log.resend_count}
                </td>
                <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden xl:table-cell">
                  {log.sent_at ? formatDate(log.sent_at) : "—"}
                </td>
                <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden 2xl:table-cell">
                  {formatDate(log.created_at)}
                </td>
                <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onView(log)}
                      disabled={isSending}
                      className="p-1.5 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--text-tertiary)] hover:text-[var(--accent-blue)] transition-colors disabled:opacity-50"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {log.status === "failed" && (
                      <button
                        onClick={() => onRetry(log.id)}
                        disabled={isSending}
                        className="p-1.5 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--text-tertiary)] hover:text-[var(--primary-color)] transition-colors disabled:opacity-50"
                        title="Retry failed"
                      >
                        {isSending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    {(log.status === "sent" || log.status === "resend") && (
                      <button
                        onClick={() => onResend(log.id)}
                        disabled={isSending}
                        className="p-1.5 rounded-lg hover:bg-[var(--card-hover-bg)] text-[var(--text-tertiary)] hover:text-[var(--primary-color)] transition-colors disabled:opacity-50"
                        title="Resend"
                      >
                        {isSending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(log.id)}
                      disabled={isSending}
                      className="p-1.5 rounded-lg hover:bg-[var(--danger-color)]/10 text-[var(--text-tertiary)] hover:text-[var(--danger-color)] transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};