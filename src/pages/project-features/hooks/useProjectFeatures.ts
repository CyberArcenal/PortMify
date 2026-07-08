// src/pages/project-features/hooks/useProjectFeatures.ts
import projectFeatureAPI, { ProjectFeature } from "@/api/core/project_feature";
import { useState, useEffect, useCallback, useRef } from "react";

export interface ProjectFeatureFilters {
  search: string;
}

export interface ProjectFeatureWithDetails extends ProjectFeature {}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseProjectFeaturesReturn {
  features: ProjectFeatureWithDetails[];
  filters: ProjectFeatureFilters;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedFeatures: number[];
  setSelectedFeatures: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCount: number;
  reload: () => void;
  handleFilterChange: (key: keyof ProjectFeatureFilters, value: string) => void;
  resetFilters: () => void;
  toggleFeatureSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useProjectFeatures = (
  projectId: number | null,
  initialFilters?: Partial<ProjectFeatureFilters>,
): UseProjectFeaturesReturn => {
  const [features, setFeatures] = useState<ProjectFeatureWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<number[]>([]);
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

  const [filters, setFilters] = useState<ProjectFeatureFilters>({
    search: "",
    ...initialFilters,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchFeatures = useCallback(async () => {
    if (!projectId) {
      setFeatures([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params: any = {
        project_id: projectId,
        page: currentPage,
        page_size: pageSize,
      };

      const response = await projectFeatureAPI.list(params);
      if (mountedRef.current) {
        setFeatures(response.results);
        setTotalCount(response.pagination.count);
        setSelectedFeatures([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load features");
        console.error("Feature loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [projectId, currentPage, pageSize]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalCount,
    page_size: pageSize,
  };

  // Local filtering
  const filteredFeatures = features.filter((f) => {
    if (!filters.search) return true;
    return f.description.toLowerCase().includes(filters.search.toLowerCase());
  });

  // Local sorting
  const sortedFeatures = [...filteredFeatures].sort((a, b) => {
    const key = sortConfig.key;
    if (key === "order") {
      return sortConfig.direction === "asc" ? a.order - b.order : b.order - a.order;
    }
    if (key === "description") {
      const aVal = a.description || "";
      const bVal = b.description || "";
      return sortConfig.direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return 0;
  });

  const handleFilterChange = useCallback(
    (key: keyof ProjectFeatureFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
    });
    setCurrentPage(1);
  }, []);

  const toggleFeatureSelection = useCallback((id: number) => {
    setSelectedFeatures((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedFeatures((prev) =>
      prev.length === sortedFeatures.length ? [] : sortedFeatures.map((f) => f.id)
    );
  }, [sortedFeatures]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    features: sortedFeatures,
    filters,
    loading,
    error,
    pagination,
    selectedFeatures,
    setSelectedFeatures,
    sortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    totalCount,
    reload,
    handleFilterChange,
    resetFilters,
    toggleFeatureSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useProjectFeatures;