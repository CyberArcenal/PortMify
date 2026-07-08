// src/components/UI/BulkActionsBar.tsx
import React from "react";
import { X, Trash2, CheckCircle, XCircle, Download } from "lucide-react";
import Button from "./Button";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onExport?: () => void;
  loading?: boolean;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onClearSelection,
  onDelete,
  onApprove,
  onReject,
  onExport,
  loading = false,
}) => {
  return (
    <div className="bg-[var(--primary-color)]/10 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 border border-[var(--primary-color)]/30">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
        </span>
        <button
          onClick={onClearSelection}
          className="p-1 rounded-full hover:bg-[var(--card-hover-bg)] transition-colors"
          title="Clear selection"
        >
          <X className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {onExport && (
          <Button variant="secondary" size="sm" icon={Download} onClick={onExport}>
            Export
          </Button>
        )}
        {onApprove && (
          <Button
            variant="success"
            size="sm"
            icon={CheckCircle}
            onClick={onApprove}
            loading={loading}
          >
            Approve
          </Button>
        )}
        {onReject && (
          <Button
            variant="danger"
            size="sm"
            icon={XCircle}
            onClick={onReject}
            loading={loading}
          >
            Reject
          </Button>
        )}
        <Button
          variant="danger"
          size="sm"
          icon={Trash2}
          onClick={onDelete}
          loading={loading}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default BulkActionsBar;