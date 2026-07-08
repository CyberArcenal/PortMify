// src/pages/project-gallery/components/ProjectGalleryTable.tsx
import React from "react";
import { ChevronUp, ChevronDown, Image } from "lucide-react";
import type { ProjectGalleryImageWithDetails } from "../hooks/useProjectGallery";
import ProjectGalleryActionsDropdown from "./ProjectGalleryActionsDropdown";

interface ProjectGalleryTableProps {
  images: ProjectGalleryImageWithDetails[];
  selectedImages: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (image: ProjectGalleryImageWithDetails) => void;
  onEdit: (image: ProjectGalleryImageWithDetails) => void;
  onDelete: (image: ProjectGalleryImageWithDetails) => void;
}

const ProjectGalleryTable: React.FC<ProjectGalleryTableProps> = ({
  images,
  selectedImages,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  sortConfig,
  onView,
  onEdit,
  onDelete,
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No images found for this project.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
          <tr>
            <th className="py-3 px-4 w-8">
              <input
                type="checkbox"
                checked={images.length > 0 && selectedImages.length === images.length}
                onChange={onToggleSelectAll}
                className="rounded border-[var(--border-color)] cursor-pointer"
              />
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden sm:table-cell"
              onClick={() => onSort("order")}
            >
              <div className="flex items-center gap-1">
                Order {getSortIcon("order")}
              </div>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Image
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] hidden md:table-cell"
            >
              URL
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {images.map((image) => (
            <tr
              key={image.id}
              className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors cursor-pointer"
              onClick={() => onView(image)}
            >
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedImages.includes(image.id)}
                  onChange={() => onToggleSelect(image.id)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden sm:table-cell">
                {image.order}
              </td>
              <td className="py-2.5 px-4">
                {image.image_url ? (
                  <img
                    src={image.image_url}
                    alt="Gallery"
                    className="h-12 w-12 object-cover rounded-lg border border-[var(--border-color)]"
                  />
                ) : (
                  <div className="h-12 w-12 bg-[var(--card-secondary-bg)] flex items-center justify-center rounded-lg border border-[var(--border-color)]">
                    <Image className="w-5 h-5 text-[var(--text-secondary)]" />
                  </div>
                )}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs truncate max-w-[200px] hidden md:table-cell">
                {image.image_url}
              </td>
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <ProjectGalleryActionsDropdown
                  image={image}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectGalleryTable;