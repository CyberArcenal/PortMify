// src/pages/users/hooks/useUsers.ts
import userAPI, { User } from "@/api/core/user";
import { useState, useEffect, useCallback, useRef } from "react";

export interface UserFilters {
  search: string;
  user_type: string;
  status: string;
  is_active: string;
}

export interface UserWithDetails extends User {}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseUsersReturn {
  users: UserWithDetails[];
  filters: UserFilters;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedUsers: number[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCount: number;
  reload: () => void;
  handleFilterChange: (key: keyof UserFilters, value: string) => void;
  resetFilters: () => void;
  toggleUserSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useUsers = (
  initialFilters?: Partial<UserFilters>,
): UseUsersReturn => {
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "date_joined",
    direction: "desc",
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    user_type: "",
    status: "",
    is_active: "",
    ...initialFilters,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        page: currentPage,
        page_size: pageSize,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
      };
      if (filters.search) params.search = filters.search;
      if (filters.user_type) params.user_type = filters.user_type;
      if (filters.status) params.status = filters.status;
      if (filters.is_active !== "") params.is_active = filters.is_active === "true";

      const response = await userAPI.list(params);
      if (mountedRef.current) {
        setUsers(response.results);
        setTotalCount(response.pagination.count);
        setSelectedUsers([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load users");
        console.error("User loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, sortConfig.key, sortConfig.direction, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalCount,
    page_size: pageSize,
  };

  const handleFilterChange = useCallback(
    (key: keyof UserFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      user_type: "",
      status: "",
      is_active: "",
    });
    setCurrentPage(1);
  }, []);

  const toggleUserSelection = useCallback((id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedUsers((prev) =>
      prev.length === users.length ? [] : users.map((u) => u.id)
    );
  }, [users]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    users,
    filters,
    loading,
    error,
    pagination,
    selectedUsers,
    setSelectedUsers,
    sortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    totalCount,
    reload,
    handleFilterChange,
    resetFilters,
    toggleUserSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useUsers;