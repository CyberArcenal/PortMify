// src/pages/stats/index.tsx
import React, { useState } from "react";
import { Edit, RefreshCw, BarChart3 } from "lucide-react";
import Button from "../../components/UI/Button";
import { showSuccess, showError } from "../../utils/notification";

import useStats from "./hooks/useStats";
import StatsDisplay from "./components/StatsDisplay";
import StatsFormDialog from "./components/StatsFormDialog";

const StatsPage: React.FC = () => {
  const { stats, loading, error, reload, updateStats } = useStats();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEdit = () => {
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleFormSuccess = async (data: any) => {
    try {
      await updateStats(data);
      showSuccess("Stats updated successfully");
      setIsFormOpen(false);
    } catch (err: any) {
      showError(err.message || "Failed to update stats");
    }
  };

  return (
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--sidebar-text)]">
            Statistics
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage your portfolio statistics
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={reload}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Button
            onClick={handleEdit}
            variant="primary"
            size="sm"
            icon={Edit}
            iconPosition="left"
            disabled={!stats && !loading}
          >
            {stats ? "Edit Stats" : "Create Stats"}
          </Button>
        </div>
      </div>

      {/* ─── Loading ─── */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent" />
        </div>
      )}

      {/* ─── Error ─── */}
      {error && (
        <div className="text-center py-8 text-[var(--danger-color)]">
          Error: {error}
        </div>
      )}

      {/* ─── Stats Display ─── */}
      {!loading && !error && stats && (
        <StatsDisplay stats={stats} />
      )}

      {/* ─── Empty State ─── */}
      {!loading && !error && !stats && (
        <div className="text-center py-12 border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)] opacity-50" />
          <p className="text-base font-medium text-[var(--sidebar-text)]">
            No statistics found.
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Click the button below to create your first stats.
          </p>
          <div className="mt-4">
            <Button
              onClick={handleEdit}
              variant="primary"
              size="sm"
              icon={Edit}
              iconPosition="left"
            >
              Create Stats
            </Button>
          </div>
        </div>
      )}

      {/* ─── Form Dialog ─── */}
      <StatsFormDialog
        isOpen={isFormOpen}
        initialData={stats}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

export default StatsPage;