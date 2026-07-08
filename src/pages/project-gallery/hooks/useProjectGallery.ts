// src/pages/project-gallery/hooks/useProjectGallery.ts
import projectGalleryAPI, { ProjectGalleryImage } from "@/api/core/project_gallery";
import { useState, useEffect, useCallback, useRef } from "react";

export interface ProjectGalleryFilters {
  search: string;
}

export interface ProjectGalleryImageWithDetails extends ProjectGalleryImage {}

export interface PaginationType {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
}

interface UseProjectGalleryReturn {
  images: ProjectGalleryImageWithDetails[];
  filters: ProjectGalleryFilters;
  loading: boolean;
  error: string | null;
  pagination: PaginationType;
  selectedImages: number[];
  setSelectedImages: React.Dispatch<React.SetStateAction<number[]>>;
  sortConfig: { key: string; direction: "asc" | "desc" };
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCount: number;
  reload: () => void;
  handleFilterChange: (key: keyof ProjectGalleryFilters, value: string) => void;
  resetFilters: () => void;
  toggleImageSelection: (id: number) => void;
  toggleSelectAll: () => void;
  handleSort: (key: string) => void;
}

const useProjectGallery = (
  projectId: number | null,
  initialFilters?: Partial<ProjectGalleryFilters>,
): UseProjectGalleryReturn => {
  const [images, setImages] = useState<ProjectGalleryImageWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
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

  const [filters, setFilters] = useState<ProjectGalleryFilters>({
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

  const fetchImages = useCallback(async () => {
    if (!projectId) {
      setImages([]);
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

      const response = await projectGalleryAPI.list(params);
      if (mountedRef.current) {
        setImages(response.results);
        setTotalCount(response.pagination.count);
        setSelectedImages([]);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || "Failed to load images");
        console.error("Gallery loading error:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [projectId, currentPage, pageSize]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const pagination = {
    current_page: currentPage,
    total_pages: totalPages,
    count: totalCount,
    page_size: pageSize,
  };

  // Local filtering
  const filteredImages = images.filter((img) => {
    if (!filters.search) return true;
    return img.image_url?.toLowerCase().includes(filters.search.toLowerCase());
  });

  // Local sorting
  const sortedImages = [...filteredImages].sort((a, b) => {
    if (sortConfig.key === "order") {
      return sortConfig.direction === "asc" ? a.order - b.order : b.order - a.order;
    }
    return 0;
  });

  const handleFilterChange = useCallback(
    (key: keyof ProjectGalleryFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    },
    []
  );

  const resetFilters = useCallback(() => {
    setFilters({ search: "" });
    setCurrentPage(1);
  }, []);

  const toggleImageSelection = useCallback((id: number) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((iid) => iid !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedImages((prev) =>
      prev.length === sortedImages.length ? [] : sortedImages.map((img) => img.id)
    );
  }, [sortedImages]);

  const handleSort = useCallback((key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  }, []);

  const reload = useCallback(() => {
    fetchImages();
  }, [fetchImages]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  return {
    images: sortedImages,
    filters,
    loading,
    error,
    pagination,
    selectedImages,
    setSelectedImages,
    sortConfig,
    pageSize,
    setPageSize: setPageSizeHandler,
    currentPage,
    setCurrentPage,
    totalCount,
    reload,
    handleFilterChange,
    resetFilters,
    toggleImageSelection,
    toggleSelectAll,
    handleSort,
  };
};

export default useProjectGallery;