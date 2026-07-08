// src/pages/contact-messages/hooks/useContactMessages.ts
import contactMessageAPI, { ContactMessage } from "@/api/core/contact_message";
import { useState, useEffect, useCallback, useRef } from "react";

export interface ContactMessageFilters {
  search: string;
  is_read: string;
}

export interface ContactMessageWithDetails extends ContactMessage {}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseContactMessagesReturn {
  messages: ContactMessageWithDetails[];
  filters: ContactMessageFilters;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedMessages: number[];
  setSelectedMessages: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCount: number;
  reload: () => void;
  handleFilterChange: (key: keyof ContactMessageFilters, value: string) => void;
  resetFilters: () => void;
  toggleMessageSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useContactMessages = (
  initialFilters?: Partial<ContactMessageFilters>
): UseContactMessagesReturn => {
  const [messages, setMessages] = useState<ContactMessageWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "created_at",
    direction: "desc",
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<ContactMessageFilters>({
    search: "",
    is_read: "",
    ...initialFilters,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchMessages = useCallback(async () => {
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
      if (filters.is_read !== "") params.is_read = filters.is_read === "true";

      const response = await contactMessageAPI.list(params);
      if (mountedRef.current) {
        setMessages(response.results);
        setTotalCount(response.pagination.count);
        setSelectedMessages([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load messages");
        console.error("Message loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, sortConfig.key, sortConfig.direction, filters]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalCount,
    page_size: pageSize,
  };

  const handleFilterChange = useCallback(
    (key: keyof ContactMessageFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      is_read: "",
    });
    setCurrentPage(1);
  }, []);

  const toggleMessageSelection = useCallback((id: number) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedMessages((prev) =>
      prev.length === messages.length ? [] : messages.map((m) => m.id)
    );
  }, [messages]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    messages,
    filters,
    loading,
    error,
    pagination,
    selectedMessages,
    setSelectedMessages,
    sortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    totalCount,
    reload,
    handleFilterChange,
    resetFilters,
    toggleMessageSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useContactMessages;