// src/pages/subscribers/hooks/useSubscribers.ts
import subscriberAPI, { Subscriber } from "@/api/core/subscriber";
import { useState, useEffect, useCallback, useRef } from "react";

export interface SubscriberFilters {
  search: string;
  is_active: string;
  confirmed: string;
}

export interface SubscriberWithDetails extends Subscriber {}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseSubscribersReturn {
  subscribers: SubscriberWithDetails[];
  filters: SubscriberFilters;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedSubscribers: number[];
  setSelectedSubscribers: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCount: number;
  reload: () => void;
  handleFilterChange: (key: keyof SubscriberFilters, value: string) => void;
  resetFilters: () => void;
  toggleSubscriberSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useSubscribers = (
  initialFilters?: Partial<SubscriberFilters>,
): UseSubscribersReturn => {
  const [subscribers, setSubscribers] = useState<SubscriberWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubscribers, setSelectedSubscribers] = useState<number[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "subscribed_at",
    direction: "desc",
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<SubscriberFilters>({
    search: "",
    is_active: "",
    confirmed: "",
    ...initialFilters,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchSubscribers = useCallback(async () => {
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
      if (filters.is_active !== "") params.is_active = filters.is_active === "true";
      if (filters.confirmed !== "") params.confirmed = filters.confirmed === "true";

      const response = await subscriberAPI.list(params);
      if (mountedRef.current) {
        setSubscribers(response.results);
        setTotalCount(response.pagination.count);
        setSelectedSubscribers([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load subscribers");
        console.error("Subscriber loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, sortConfig.key, sortConfig.direction, filters]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalCount,
    page_size: pageSize,
  };

  const handleFilterChange = useCallback(
    (key: keyof SubscriberFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      is_active: "",
      confirmed: "",
    });
    setCurrentPage(1);
  }, []);

  const toggleSubscriberSelection = useCallback((id: number) => {
    setSelectedSubscribers((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedSubscribers((prev) =>
      prev.length === subscribers.length ? [] : subscribers.map((s) => s.id)
    );
  }, [subscribers]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    subscribers,
    filters,
    loading,
    error,
    pagination,
    selectedSubscribers,
    setSelectedSubscribers,
    sortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    totalCount,
    reload,
    handleFilterChange,
    resetFilters,
    toggleSubscriberSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useSubscribers;