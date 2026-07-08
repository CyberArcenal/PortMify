// src/pages/project-techstacks/hooks/useProjectTechStacks.ts
import projectTechStackAPI, { ProjectTechStack } from "@/api/core/project_techstack";
import { useState, useEffect, useCallback, useRef } from "react";

export interface ProjectTechStackFilters {
  search: string;
  category: string;
}

export interface ProjectTechStackWithDetails extends ProjectTechStack {}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseProjectTechStacksReturn {
  techStacks: ProjectTechStackWithDetails[];
  filters: ProjectTechStackFilters;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedItems: number[];
  setSelectedItems: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCount: number;
  reload: () => void;
  handleFilterChange: (key: keyof ProjectTechStackFilters, value: string) => void;
  resetFilters: () => void;
  toggleItemSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useProjectTechStacks = (
  projectId: number | null,
  initialFilters?: Partial<ProjectTechStackFilters>,
): UseProjectTechStacksReturn => {
  const [techStacks, setTechStacks] = useState<ProjectTechStackWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
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

  const [filters, setFilters] = useState<ProjectTechStackFilters>({
    search: "",
    category: "",
    ...initialFilters,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchItems = useCallback(async () => {
    if (!projectId) {
      setTechStacks([]);
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

      const response = await projectTechStackAPI.list(params);
      if (mountedRef.current) {
        setTechStacks(response.results);
        setTotalCount(response.pagination.count);
        setSelectedItems([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load tech stack items");
        console.error("Tech stack loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [projectId, currentPage, pageSize]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalCount,
    page_size: pageSize,
  };

  // Local filtering
  const filteredItems = techStacks.filter((item) => {
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.category && item.category.toLowerCase() !== filters.category.toLowerCase()) {
      return false;
    }
    return true;
  });

  // Local sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortConfig.key === "order") {
      return sortConfig.direction === "asc" ? a.order - b.order : b.order - a.order;
    }
    if (sortConfig.key === "name") {
      const aVal = a.name || "";
      const bVal = b.name || "";
      return sortConfig.direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    if (sortConfig.key === "category") {
      const aVal = a.category || "";
      const bVal = b.category || "";
      return sortConfig.direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return 0;
  });

  const handleFilterChange = useCallback(
    (key: keyof ProjectTechStackFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({ search: "", category: "" });
    setCurrentPage(1);
  }, []);

  const toggleItemSelection = useCallback((id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((iid) => iid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedItems((prev) =>
      prev.length === sortedItems.length ? [] : sortedItems.map((item) => item.id)
    );
  }, [sortedItems]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchItems();
  }, [fetchItems]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    techStacks: sortedItems,
    filters,
    loading,
    error,
    pagination,
    selectedItems,
    setSelectedItems,
    sortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    totalCount,
    reload,
    handleFilterChange,
    resetFilters,
    toggleItemSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useProjectTechStacks;