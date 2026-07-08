// src/pages/education/hooks/useEducation.ts
import educationAPI, { Education } from "@/api/core/education";
import { useState, useEffect, useCallback, useRef } from "react";

export interface EducationFilters {
  search: string;
  current: string; // "true", "false", ""
}

export interface EducationWithDetails extends Education {}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseEducationReturn {
  education: EducationWithDetails[];
  filters: EducationFilters;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedEducation: number[];
  setSelectedEducation: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCount: number;
  reload: () => void;
  handleFilterChange: (key: keyof EducationFilters, value: string) => void;
  resetFilters: () => void;
  toggleEducationSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useEducation = (initialFilters?: Partial<EducationFilters>): UseEducationReturn => {
  const [education, setEducation] = useState<EducationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEducation, setSelectedEducation] = useState<number[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "start_date",
    direction: "desc",
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<EducationFilters>({
    search: "",
    current: "",
    ...initialFilters,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchEducation = useCallback(async () => {
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
      if (filters.current !== "") params.current = filters.current === "true";

      const response = await educationAPI.list(params);
      if (mountedRef.current) {
        setEducation(response.results);
        setTotalCount(response.pagination.count);
        setSelectedEducation([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load education records");
        console.error("Education loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, sortConfig.key, sortConfig.direction, filters]);

  useEffect(() => {
    fetchEducation();
  }, [fetchEducation]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalCount,
    page_size: pageSize,
  };

  const handleFilterChange = useCallback(
    (key: keyof EducationFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      current: "",
    });
    setCurrentPage(1);
  }, []);

  const toggleEducationSelection = useCallback((id: number) => {
    setSelectedEducation((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedEducation((prev) =>
      prev.length === education.length ? [] : education.map((e) => e.id)
    );
  }, [education]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchEducation();
  }, [fetchEducation]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    education,
    filters,
    loading,
    error,
    pagination,
    selectedEducation,
    setSelectedEducation,
    sortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    totalCount,
    reload,
    handleFilterChange,
    resetFilters,
    toggleEducationSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useEducation;