// src/pages/projects/components/ProjectTable.tsx
import React from "react";
import { ChevronUp, ChevronDown, Star, Globe, Github } from "lucide-react";
import type { ProjectWithDetails } from "../hooks/useProjects";
import ProjectActionsDropdown from "./ProjectActionsDropdown";
import { formatDate } from "../../../utils/formatters";

interface ProjectTableProps {
  projects: ProjectWithDetails[];
  selectedProjects: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: "asc" | "desc" };
  onView: (project: ProjectWithDetails) => void;
  onEdit: (project: ProjectWithDetails) => void;
  onDelete: (project: ProjectWithDetails) => void;
  onToggleFeatured?: (project: ProjectWithDetails) => void;
}

const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  selectedProjects,
  onToggleSelect,
  onToggleSelectAll,
  onSort,
  sortConfig,
  onView,
  onEdit,
  onDelete,
  onToggleFeatured,
}) => {
  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-3 h-3" />
    ) : (
      <ChevronDown className="w-3 h-3" />
    );
  };

  const getProjectTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      web: "bg-[var(--accent-blue-light)] text-[var(--accent-blue)]",
      mobile: "bg-[var(--accent-green-light)] text-[var(--accent-green)]",
      design: "bg-[var(--accent-purple-light)] text-[var(--accent-purple)]",
      desktop: "bg-[var(--accent-orange-light)] text-[var(--accent-orange)]",
      other: "bg-[var(--status-inactive-bg)] text-[var(--status-inactive-text)]",
    };
    const display: Record<string, string> = {
      web: "Web",
      mobile: "Mobile",
      design: "Design",
      desktop: "Desktop",
      other: "Other",
    };
    return (
      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[type] || colors.other}`}>
        {display[type] || type}
      </span>
    );
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No projects found.
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
                checked={projects.length > 0 && selectedProjects.length === projects.length}
                onChange={onToggleSelectAll}
                className="rounded border-[var(--border-color)] cursor-pointer"
              />
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
              onClick={() => onSort("title")}
            >
              <div className="flex items-center gap-1">
                Title {getSortIcon("title")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden md:table-cell"
              onClick={() => onSort("project_type")}
            >
              <div className="flex items-center gap-1">
                Type {getSortIcon("project_type")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden lg:table-cell"
              onClick={() => onSort("demo_url")}
            >
              <div className="flex items-center gap-1">
                Links {getSortIcon("demo_url")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden sm:table-cell"
              onClick={() => onSort("featured")}
            >
              <div className="flex items-center gap-1">
                Featured {getSortIcon("featured")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden xl:table-cell"
              onClick={() => onSort("created_at")}
            >
              <div className="flex items-center gap-1">
                Created {getSortIcon("created_at")}
              </div>
            </th>
            <th
              className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)] hidden 2xl:table-cell"
              onClick={() => onSort("views")}
            >
              <div className="flex items-center gap-1">
                Views {getSortIcon("views")}
              </div>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-[var(--text-secondary)]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr
              key={project.id}
              className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors cursor-pointer"
              onClick={() => onView(project)}
            >
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedProjects.includes(project.id)}
                  onChange={() => onToggleSelect(project.id)}
                  className="rounded border-[var(--border-color)] cursor-pointer"
                />
              </td>
              <td className="py-2.5 px-4 text-[var(--text-primary)] font-medium">
                {project.title}
              </td>
              <td className="py-2.5 px-4 hidden md:table-cell">
                {getProjectTypeBadge(project.project_type?.name)}
              </td>
              <td className="py-2.5 px-4 hidden lg:table-cell">
                <div className="flex items-center gap-2">
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--accent-blue)] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  {project.source_code_url && (
                    <a
                      href={project.source_code_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--text-secondary)] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {!project.demo_url && !project.source_code_url && (
                    <span className="text-[var(--text-tertiary)] text-xs">—</span>
                  )}
                </div>
              </td>
              <td className="py-2.5 px-4 hidden sm:table-cell">
                {project.featured ? (
                  <Star className="w-4 h-4 text-[var(--secondary-color)]" />
                ) : (
                  <span className="text-[var(--text-tertiary)]">—</span>
                )}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-xs hidden xl:table-cell">
                {formatDate(project.created_at)}
              </td>
              <td className="py-2.5 px-4 text-[var(--text-secondary)] text-right hidden 2xl:table-cell">
                {project.views.toLocaleString()}
              </td>
              <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                <ProjectActionsDropdown
                  project={project}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleFeatured={onToggleFeatured}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;