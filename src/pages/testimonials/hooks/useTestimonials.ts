// src/pages/testimonials/hooks/useTestimonials.ts
import testimonialAPI, { Testimonial } from "@/api/core/testimonial";
import { useState, useEffect, useCallback, useRef } from "react";

export interface TestimonialFilters {
  search: string;
  featured: string;
  approved: string;
}

export interface TestimonialWithDetails extends Testimonial {}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseTestimonialsReturn {
  testimonials: TestimonialWithDetails[];
  filters: TestimonialFilters;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedTestimonials: number[];
  setSelectedTestimonials: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCount: number;
  reload: () => void;
  handleFilterChange: (key: keyof TestimonialFilters, value: string) => void;
  resetFilters: () => void;
  toggleTestimonialSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useTestimonials = (
  initialFilters?: Partial<TestimonialFilters>,
): UseTestimonialsReturn => {
  const [testimonials, setTestimonials] = useState<TestimonialWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTestimonials, setSelectedTestimonials] = useState<number[]>([]);
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

  const [filters, setFilters] = useState<TestimonialFilters>({
    search: "",
    featured: "",
    approved: "",
    ...initialFilters,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchTestimonials = useCallback(async () => {
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
      if (filters.featured !== "") params.featured = filters.featured === "true";
      if (filters.approved !== "") params.approved = filters.approved === "true";

      const response = await testimonialAPI.list(params);
      if (mountedRef.current) {
        setTestimonials(response.results);
        setTotalCount(response.pagination.count);
        setSelectedTestimonials([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load testimonials");
        console.error("Testimonials loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, sortConfig.key, sortConfig.direction, filters]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalCount,
    page_size: pageSize,
  };

  const handleFilterChange = useCallback(
    (key: keyof TestimonialFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      featured: "",
      approved: "",
    });
    setCurrentPage(1);
  }, []);

  const toggleTestimonialSelection = useCallback((id: number) => {
    setSelectedTestimonials((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedTestimonials((prev) =>
      prev.length === testimonials.length ? [] : testimonials.map((t) => t.id)
    );
  }, [testimonials]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    testimonials,
    filters,
    loading,
    error,
    pagination,
    selectedTestimonials,
    setSelectedTestimonials,
    sortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    totalCount,
    reload,
    handleFilterChange,
    resetFilters,
    toggleTestimonialSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useTestimonials;