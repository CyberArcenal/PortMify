// src/pages/email-templates/hooks/useEmailTemplates.ts
import emailTemplateAPI, { EmailTemplate } from "@/api/core/email_template";
import { useState, useEffect, useCallback, useRef } from "react";

export interface EmailTemplateFilters {
  search: string;
  name: string;
}

export interface EmailTemplateWithDetails extends EmailTemplate {}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseEmailTemplatesReturn {
  templates: EmailTemplateWithDetails[];
  filters: EmailTemplateFilters;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedTemplates: number[];
  setSelectedTemplates: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCount: number;
  reload: () => void;
  handleFilterChange: (key: keyof EmailTemplateFilters, value: string) => void;
  resetFilters: () => void;
  toggleTemplateSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useEmailTemplates = (
  initialFilters?: Partial<EmailTemplateFilters>,
): UseEmailTemplatesReturn => {
  const [templates, setTemplates] = useState<EmailTemplateWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
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

  const [filters, setFilters] = useState<EmailTemplateFilters>({
    search: "",
    name: "",
    ...initialFilters,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchTemplates = useCallback(async () => {
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
      if (filters.name) params.name = filters.name;

      const response = await emailTemplateAPI.list(params);
      if (mountedRef.current) {
        setTemplates(response.results);
        setTotalCount(response.pagination.count);
        setSelectedTemplates([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load email templates");
        console.error("Email template loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, sortConfig.key, sortConfig.direction, filters]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalCount,
    page_size: pageSize,
  };

  const handleFilterChange = useCallback(
    (key: keyof EmailTemplateFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      name: "",
    });
    setCurrentPage(1);
  }, []);

  const toggleTemplateSelection = useCallback((id: number) => {
    setSelectedTemplates((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedTemplates((prev) =>
      prev.length === templates.length ? [] : templates.map((t) => t.id)
    );
  }, [templates]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    templates,
    filters,
    loading,
    error,
    pagination,
    selectedTemplates,
    setSelectedTemplates,
    sortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    totalCount,
    reload,
    handleFilterChange,
    resetFilters,
    toggleTemplateSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useEmailTemplates;