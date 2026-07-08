// src/pages/users/index.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Plus, RefreshCw, Eye, EyeOff, Filter, Users } from "lucide-react";
import Button from "../../components/UI/Button";
import { dialogs } from "../../utils/dialogs";
import { showSuccess, showError } from "../../utils/notification";
import { usePagination } from "../../contexts/PaginationContext";

import useUsers, { type UserWithDetails } from "./hooks/useUsers";
import useUserForm from "./hooks/useUserForm";
import { useUserView } from "./hooks/useUserView";
import UserTable from "./components/UserTable";
import UserViewDialog from "./components/UserViewDialog";
import UserFormDialog from "./components/UserFormDialog";
import FilterBar from "./components/FilterBar";
import SummaryCards from "../../components/UI/SummaryCards";
import BulkActionsBar from "../../components/UI/BulkActionsBar";
import userAPI from "@/api/core/user";

import { Users as UsersIcon, UserCheck, Shield, Crown } from "lucide-react";

const UsersPage: React.FC = () => {
  const {
    users,
    filters,
    loading,
    error,
    pagination,
    selectedUsers,
    setSelectedUsers,
    sortConfig,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    reload,
    handleFilterChange,
    resetFilters,
    toggleUserSelection,
    toggleSelectAll,
    handleSort,
    totalCount,
  } = useUsers();

  const formDialog = useUserForm();
  const viewDialog = useUserView();

  const [showStats, setShowStats] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const { setPagination, clearPagination } = usePagination();

  // ─── Pagination Integration ──────────────────────────────────────
  const handlePageChange = useCallback(
    (newPage: number) => setCurrentPage(newPage),
    [setCurrentPage]
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setPageSize(newSize);
      setCurrentPage(1);
    },
    [setPageSize, setCurrentPage]
  );

  const handlersRef = useRef({
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
  });

  useEffect(() => {
    handlersRef.current = {
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    };
  }, [handlePageChange, handlePageSizeChange]);

  const prevPageRef = useRef(currentPage);
  const prevTotalRef = useRef(totalCount);
  const prevLimitRef = useRef(pageSize);

  useEffect(() => {
    const pageChanged = prevPageRef.current !== currentPage;
    const totalChanged = prevTotalRef.current !== totalCount;
    const limitChanged = prevLimitRef.current !== pageSize;

    if (pageChanged || totalChanged || limitChanged) {
      prevPageRef.current = currentPage;
      prevTotalRef.current = totalCount;
      prevLimitRef.current = pageSize;

      setPagination({
        currentPage,
        totalItems: totalCount,
        pageSize,
        onPageChange: handlersRef.current.onPageChange,
        onPageSizeChange: handlersRef.current.onPageSizeChange,
        pageSizeOptions: [10, 25, 50, 100],
        showPageSize: true,
      });
    }
  }, [currentPage, totalCount, pageSize, setPagination]);

  useEffect(() => {
    return () => clearPagination();
  }, [clearPagination]);

  // ─── Handlers ────────────────────────────────────────────────────
  const handleToggleActive = async (user: UserWithDetails) => {
    try {
      await userAPI.patch(user.id, { is_active: !user.is_active });
      showSuccess(user.is_active ? "User deactivated" : "User activated");
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleToggleStaff = async (user: UserWithDetails) => {
    try {
      await userAPI.patch(user.id, { is_staff: !user.is_staff });
      showSuccess(
        user.is_staff ? "Staff privileges removed" : "Staff privileges granted"
      );
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleToggleSuperuser = async (user: UserWithDetails) => {
    try {
      await userAPI.patch(user.id, { is_superuser: !user.is_superuser });
      showSuccess(
        user.is_superuser ? "Superuser privileges removed" : "Superuser privileges granted"
      );
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  const handleDelete = async (user: UserWithDetails) => {
    const confirmed = await dialogs.confirm({
      title: "Delete User",
      message: `Are you sure you want to delete user "${user.username}"?`,
    });
    if (!confirmed) return;
    try {
      await userAPI.delete(user.id);
      showSuccess("User deleted successfully.");
      reload();
    } catch (err: any) {
      dialogs.alert({ title: "Error", message: err.message });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    const confirmed = await dialogs.confirm({
      title: "Bulk Delete",
      message: `Delete ${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""}?`,
    });
    if (!confirmed) return;
    try {
      await Promise.all(selectedUsers.map((id) => userAPI.delete(id)));
      showSuccess(`${selectedUsers.length} user${selectedUsers.length > 1 ? "s" : ""} deleted.`);
      setSelectedUsers([]);
      reload();
    } catch (err: any) {
      showError(err.message);
    }
  };

  // ─── Summary Cards ──────────────────────────────────────────────
  const activeCount = users?.filter((u) => u.is_active).length || 0;
  const staffCount = users?.filter((u) => u.is_staff).length || 0;
  const superuserCount = users?.filter((u) => u.is_superuser).length || 0;

  const summaryCards = [
    {
      title: "Total Users",
      value: pagination.count,
      icon: UsersIcon,
      color: "blue",
    },
    {
      title: "Active",
      value: activeCount,
      icon: UserCheck,
      color: "green",
    },
    {
      title: "Staff",
      value: staffCount,
      icon: Shield,
      color: "purple",
    },
    {
      title: "Superusers",
      value: superuserCount,
      icon: Crown,
      color: "yellow",
    },
  ];

  const hasFilters = Object.values(filters).some((v) => v);

  return (
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--sidebar-text)]">
            Users
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Manage system users and permissions
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors"
            title={showStats ? "Hide summary" : "Show summary"}
          >
            {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors"
            title={showFilters ? "Hide filters" : "Show filters"}
          >
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={reload}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-[var(--card-hover-bg)] transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Button
            onClick={formDialog.openAdd}
            variant="primary"
            size="sm"
            icon={Plus}
            iconPosition="left"
          >
            Add User
          </Button>
        </div>
      </div>

      {/* ─── Summary Cards ─── */}
      {showStats && <SummaryCards cards={summaryCards} columns={4} />}

      {/* ─── Filter Bar ─── */}
      {showFilters && (
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
        />
      )}

      {/* ─── Bulk Actions ─── */}
      {selectedUsers.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedUsers.length}
          onClearSelection={() => setSelectedUsers([])}
          onDelete={handleBulkDelete}
          loading={loading}
        />
      )}

      {/* ─── Table ─── */}
      {loading && users.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary-color)] border-t-transparent" />
        </div>
      ) : error ? (
        <div className="text-center py-8 text-[var(--danger-color)]">
          Error: {error}
        </div>
      ) : (
        <UserTable
          users={users}
          selectedUsers={selectedUsers}
          onToggleSelect={toggleUserSelection}
          onToggleSelectAll={toggleSelectAll}
          onSort={handleSort}
          sortConfig={sortConfig}
          onView={(user) => viewDialog.open(user.id)}
          onEdit={formDialog.openEdit}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
          onToggleStaff={handleToggleStaff}
          onToggleSuperuser={handleToggleSuperuser}
        />
      )}

      {/* ─── Empty State ─── */}
      {!loading && !error && users.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)] opacity-50" />
          <p className="text-base font-medium text-[var(--sidebar-text)]">
            No users found.
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {hasFilters
              ? "Try adjusting your search or filters"
              : "Start by creating your first user"}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {hasFilters && (
              <button
                className="px-4 py-2 rounded-lg text-sm bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors"
                onClick={resetFilters}
              >
                Clear Filters
              </button>
            )}
            <button
              className="px-4 py-2 rounded-lg text-sm bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors"
              onClick={formDialog.openAdd}
            >
              Add First User
            </button>
          </div>
        </div>
      )}

      {/* ─── Dialogs ─── */}
      <UserFormDialog
        isOpen={formDialog.isOpen}
        mode={formDialog.mode}
        userId={formDialog.userId}
        initialData={formDialog.initialData}
        onClose={formDialog.close}
        onSuccess={reload}
      />

      <UserViewDialog
        isOpen={viewDialog.isOpen}
        user={viewDialog.user}
        loading={viewDialog.loading}
        onClose={viewDialog.close}
        onEdit={(user) => {
          formDialog.openEdit(user);
          viewDialog.close();
        }}
        onToggleActive={handleToggleActive}
        onToggleStaff={handleToggleStaff}
        onToggleSuperuser={handleToggleSuperuser}
      />
    </div>
  );
};

export default UsersPage;