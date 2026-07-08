// src/pages/skills/hooks/useSkills.ts
import skillAPI, { Skill } from "@/api/core/skill";
import { useState, useEffect, useCallback, useRef } from "react";

export interface SkillFilters {
  search: string;
  category: string;
  featured: string;
}

export interface SkillWithDetails extends Skill {}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseSkillsReturn {
  skills: SkillWithDetails[];
  filters: SkillFilters;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedSkills: number[];
  setSelectedSkills: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCount: number;
  reload: () => void;
  handleFilterChange: (key: keyof SkillFilters, value: string) => void;
  resetFilters: () => void;
  toggleSkillSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useSkills = (
  initialFilters?: Partial<SkillFilters>,
): UseSkillsReturn => {
  const [skills, setSkills] = useState<SkillWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "order",
    direction: "asc",
  });
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<SkillFilters>({
    search: "",
    category: "",
    featured: "",
    ...initialFilters,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchSkills = useCallback(async () => {
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
      if (filters.category) params.category = filters.category;
      if (filters.featured !== "") params.featured = filters.featured === "true";

      const response = await skillAPI.list(params);
      if (mountedRef.current) {
        setSkills(response.results);
        setTotalCount(response.pagination.count);
        setSelectedSkills([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load skills");
        console.error("Skills loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, sortConfig.key, sortConfig.direction, filters]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalCount,
    page_size: pageSize,
  };

  const handleFilterChange = useCallback(
    (key: keyof SkillFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      category: "",
      featured: "",
    });
    setCurrentPage(1);
  }, []);

  const toggleSkillSelection = useCallback((id: number) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedSkills((prev) =>
      prev.length === skills.length ? [] : skills.map((s) => s.id)
    );
  }, [skills]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchSkills();
  }, [fetchSkills]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    skills,
    filters,
    loading,
    error,
    pagination,
    selectedSkills,
    setSelectedSkills,
    sortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    totalCount,
    reload,
    handleFilterChange,
    resetFilters,
    toggleSkillSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useSkills;