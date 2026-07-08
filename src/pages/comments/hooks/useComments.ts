// src/pages/comments/hooks/useComments.ts
import commentAPI, { Comment } from "@/api/core/comment";
import { useState, useEffect, useCallback, useRef } from "react";

export interface CommentFilters {
  search: string;
  approved: string;
  content_type: string;
  object_id: string;
}

export interface CommentWithDetails extends Comment {}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseCommentsReturn {
  comments: CommentWithDetails[];
  filters: CommentFilters;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedComments: number[];
  setSelectedComments: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCount: number;
  reload: () => void;
  handleFilterChange: (key: keyof CommentFilters, value: string) => void;
  resetFilters: () => void;
  toggleCommentSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useComments = (initialFilters?: Partial<CommentFilters>): UseCommentsReturn => {
  const [comments, setComments] = useState<CommentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComments, setSelectedComments] = useState<number[]>([]);
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

  const [filters, setFilters] = useState<CommentFilters>({
    search: "",
    approved: "",
    content_type: "",
    object_id: "",
    ...initialFilters,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchComments = useCallback(async () => {
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
      if (filters.approved !== "") params.approved = filters.approved === "true";
      if (filters.content_type) params.content_type = filters.content_type;
      if (filters.object_id) params.object_id = parseInt(filters.object_id);

      const response = await commentAPI.list(params);
      if (mountedRef.current) {
        setComments(response.results);
        setTotalCount(response.pagination.count);
        setSelectedComments([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load comments");
        console.error("Comment loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, sortConfig.key, sortConfig.direction, filters]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalCount,
    page_size: pageSize,
  };

  const handleFilterChange = useCallback(
    (key: keyof CommentFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      approved: "",
      content_type: "",
      object_id: "",
    });
    setCurrentPage(1);
  }, []);

  const toggleCommentSelection = useCallback((id: number) => {
    setSelectedComments((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedComments((prev) =>
      prev.length === comments.length ? [] : comments.map((c) => c.id)
    );
  }, [comments]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchComments();
  }, [fetchComments]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    comments,
    filters,
    loading,
    error,
    pagination,
    selectedComments,
    setSelectedComments,
    sortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    totalCount,
    reload,
    handleFilterChange,
    resetFilters,
    toggleCommentSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useComments;