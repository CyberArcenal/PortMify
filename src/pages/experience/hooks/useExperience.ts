// src/pages/experience/hooks/useExperience.ts
import experienceAPI, { Experience } from "@/api/core/experience";
import { useState, useEffect, useCallback, useRef } from "react";

export interface ExperienceFilters {
  search: string;
  current: string;
}

export interface ExperienceWithDetails extends Experience {}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseExperienceReturn {
  experiences: ExperienceWithDetails[];
  filters: ExperienceFilters;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedExperiences: number[];
  setSelectedExperiences: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCount: number;
  reload: () => void;
  handleFilterChange: (key: keyof ExperienceFilters, value: string) => void;
  resetFilters: () => void;
  toggleExperienceSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useExperience = (
  initialFilters?: Partial<ExperienceFilters>,
): UseExperienceReturn => {
  const [experiences, setExperiences] = useState<ExperienceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExperiences, setSelectedExperiences] = useState<number[]>([]);
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

  const [filters, setFilters] = useState<ExperienceFilters>({
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

  const fetchExperiences = useCallback(async () => {
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

      const response = await experienceAPI.list(params);
      if (mountedRef.current) {
        setExperiences(response.results);
        setTotalCount(response.pagination.count);
        setSelectedExperiences([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load experience records");
        console.error("Experience loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, sortConfig.key, sortConfig.direction, filters]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalCount,
    page_size: pageSize,
  };

  const handleFilterChange = useCallback(
    (key: keyof ExperienceFilters, value: string) => {
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

  const toggleExperienceSelection = useCallback((id: number) => {
    setSelectedExperiences((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedExperiences((prev) =>
      prev.length === experiences.length ? [] : experiences.map((e) => e.id)
    );
  }, [experiences]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    experiences,
    filters,
    loading,
    error,
    pagination,
    selectedExperiences,
    setSelectedExperiences,
    sortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    totalCount,
    reload,
    handleFilterChange,
    resetFilters,
    toggleExperienceSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useExperience;