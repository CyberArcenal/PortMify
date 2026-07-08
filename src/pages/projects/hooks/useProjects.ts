// src/pages/projects/hooks/useProjects.ts
import projectAPI, { Project } from "@/api/core/project";
import { useState, useEffect, useCallback, useRef } from "react";

export interface ProjectFilters {
  search: string;
  featured: string;
  project_type: number | null;
}

export interface ProjectWithDetails extends Project {}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseProjectsReturn {
  projects: ProjectWithDetails[];
  filters: ProjectFilters;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedProjects: number[];
  setSelectedProjects: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCount: number;
  reload: () => void;
  handleFilterChange: (key: keyof ProjectFilters, value: string) => void;
  resetFilters: () => void;
  toggleProjectSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useProjects = (initialFilters?: Partial<ProjectFilters>): UseProjectsReturn => {
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
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

  const [filters, setFilters] = useState<ProjectFilters>({
    search: "",
    featured: "",
    project_type: null,
    ...initialFilters,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchProjects = useCallback(async () => {
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
      if (filters.featured) params.featured = filters.featured === "true";
      if (filters.project_type) params.project_type = filters.project_type;

      const response = await projectAPI.list(params);
      if (mountedRef.current) {
        setProjects(response.results);
        setTotalCount(response.pagination.count);
        setSelectedProjects([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load projects");
        console.error("Project loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, sortConfig.key, sortConfig.direction, filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalCount,
    page_size: pageSize,
  };

  const handleFilterChange = useCallback(
    (key: keyof ProjectFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      featured: "",
      project_type: null,
    });
    setCurrentPage(1);
  }, []);

  const toggleProjectSelection = useCallback((id: number) => {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedProjects((prev) =>
      prev.length === projects.length ? [] : projects.map((p) => p.id)
    );
  }, [projects]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchProjects();
  }, [fetchProjects]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    projects,
    filters,
    loading,
    error,
    pagination,
    selectedProjects,
    setSelectedProjects,
    sortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    totalCount,
    reload,
    handleFilterChange,
    resetFilters,
    toggleProjectSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useProjects;