// src/pages/blog/hooks/useBlogs.ts
import blogAPI, { Blog } from "@/api/core/blog";
import { useState, useEffect, useCallback, useRef } from "react";

export interface BlogFilters {
  search: string;
  status: string;
  featured: string;
  category: string;
}

export interface BlogWithDetails extends Blog {}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseBlogsReturn {
  blogs: BlogWithDetails[];
  filters: BlogFilters;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedBlogs: number[];
  setSelectedBlogs: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCount: number;
  reload: () => void;
  handleFilterChange: (key: keyof BlogFilters, value: string) => void;
  resetFilters: () => void;
  toggleBlogSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useBlogs = (initialFilters?: Partial<BlogFilters>): UseBlogsReturn => {
  const [blogs, setBlogs] = useState<BlogWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBlogs, setSelectedBlogs] = useState<number[]>([]);
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

  const [filters, setFilters] = useState<BlogFilters>({
    search: "",
    status: "",
    featured: "",
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

  const fetchBlogs = useCallback(async () => {
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
      if (filters.status) params.status = filters.status;
      if (filters.featured) params.featured = filters.featured === "true";
      if (filters.category) params.category = filters.category;

      const response = await blogAPI.list(params);
      if (mountedRef.current) {
        setBlogs(response.results);
        setTotalCount(response.pagination.count);
        setSelectedBlogs([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load blogs");
        console.error("Blog loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, sortConfig.key, sortConfig.direction, filters]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalCount,
    page_size: pageSize,
  };

  const handleFilterChange = useCallback(
    (key: keyof BlogFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      status: "",
      featured: "",
      category: "",
    });
    setCurrentPage(1);
  }, []);

  const toggleBlogSelection = useCallback((id: number) => {
    setSelectedBlogs((prev) =>
      prev.includes(id) ? prev.filter((bid) => bid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedBlogs((prev) =>
      prev.length === blogs.length ? [] : blogs.map((b) => b.id)
    );
  }, [blogs]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    blogs,
    filters,
    loading,
    error,
    pagination,
    selectedBlogs,
    setSelectedBlogs,
    sortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    totalCount,
    reload,
    handleFilterChange,
    resetFilters,
    toggleBlogSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useBlogs;