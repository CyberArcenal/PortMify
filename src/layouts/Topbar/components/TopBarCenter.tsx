// src/layouts/components/TopBarCenter.tsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

interface RouteInfo {
  path: string;
  name: string;
  category: string;
}

// All searchable routes – matches the ones in App.tsx
const allRoutes: RouteInfo[] = [
  // Dashboard
  { path: "/dashboard", name: "Dashboard", category: "Main" },

  // Blog
  { path: "/blog", name: "Blog Posts", category: "Blog" },
  { path: "/blog/categories", name: "Categories", category: "Blog" },
  { path: "/blog/comments", name: "Comments", category: "Blog" },

  // Projects
  { path: "/projects", name: "Projects", category: "Projects" },
  { path: "/projects/features", name: "Project Features", category: "Projects" },
  { path: "/projects/gallery", name: "Project Gallery", category: "Projects" },
  { path: "/projects/tech-stack", name: "Tech Stack", category: "Projects" },

  // Testimonials
  { path: "/testimonials", name: "Testimonials", category: "Testimonials" },

  // Profile & Skills
  { path: "/profile", name: "Profile", category: "Personal" },
  { path: "/skills", name: "Skills", category: "Personal" },
  { path: "/experience", name: "Experience", category: "Personal" },
  { path: "/education", name: "Education", category: "Personal" },

  // Engagement
  { path: "/subscribers", name: "Subscribers", category: "Engagement" },
  { path: "/contact-messages", name: "Contact Messages", category: "Engagement" },

  // System
  { path: "/stats", name: "Statistics", category: "System" },
  { path: "/notify-logs", name: "Notify Logs", category: "System" },
  { path: "/email-templates", name: "Email Templates", category: "System" },
  { path: "/users", name: "Users", category: "System" },
];

interface TopBarCenterProps {
  className?: string;
}

const TopBarCenter: React.FC<TopBarCenterProps> = ({ className = "" }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const filteredRoutes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allRoutes.filter(
      (route) =>
        route.name.toLowerCase().includes(q) ||
        route.path.toLowerCase().includes(q.replace(/\s+/g, "-")) ||
        route.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredRoutes.length > 0) {
      navigate(filteredRoutes[0].path);
      setSearchQuery("");
      setShowResults(false);
    }
  };

  const handleRouteSelect = (path: string) => {
    navigate(path);
    setSearchQuery("");
    setShowResults(false);
  };

  return (
    <div className={`flex-1 max-w-md relative ${className}`}>
      <form onSubmit={handleSearch}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-[var(--text-tertiary)]" />
          </div>
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-sm"
          />
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && searchQuery.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg bg-[var(--card-bg)] border border-[var(--border-color)] max-h-80 overflow-auto z-50">
          {filteredRoutes.length > 0 ? (
            filteredRoutes.map((route, index) => (
              <div
                key={index}
                className="px-4 py-3 cursor-pointer border-b border-[var(--border-color)] last:border-b-0 hover:bg-[var(--card-hover-bg)] transition-colors"
                onMouseDown={() => handleRouteSelect(route.path)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[var(--text-primary)] truncate">
                      {route.name}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2 mt-0.5">
                      <span className="truncate">{route.path}</span>
                      <span className="text-[var(--primary-color)] bg-[var(--primary-color)]/10 px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                        {route.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-center text-[var(--text-secondary)]">
              No pages found for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopBarCenter;