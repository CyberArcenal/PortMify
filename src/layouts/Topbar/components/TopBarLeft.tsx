// src/layouts/components/TopBarLeft.tsx
import React from "react";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

interface TopBarLeftProps {
  toggleSidebar: () => void;
}

const TopBarLeft: React.FC<TopBarLeftProps> = ({ toggleSidebar }) => {
  const location = useLocation();

  // Get current page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return "Dashboard";
    const last = segments[segments.length - 1];
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
  };

  return (
    <div className="flex items-center gap-3 min-w-[120px]">
      {/* Hamburger – always visible */}
      <button
        onClick={toggleSidebar}
        aria-label="Toggle menu"
        className="p-2 rounded-lg hover:bg-[var(--card-secondary-bg)] text-[var(--sidebar-text)] transition-all duration-200"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page Title – hidden on small screens */}
      <div className="hidden md:block">
        <h1 className="text-base font-semibold text-[var(--sidebar-text)]">
          {getPageTitle()}
        </h1>
      </div>
    </div>
  );
};

export default TopBarLeft;