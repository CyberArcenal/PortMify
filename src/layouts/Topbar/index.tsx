// src/layouts/components/TopBar.tsx
import React from "react";
import TopBarCenter from "./components/TopBarCenter";
import TopBarLeft from "./components/TopBarLeft";
import TopBarRight from "./components/TopBarRight";

interface TopBarProps {
  toggleSidebar: () => void;
  onRefresh?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ toggleSidebar, onRefresh }) => {
  return (
    <header
      className="sticky top-0 z-10 bg-[var(--sidebar-bg)] border-b border-[var(--sidebar-border)]"
      style={{ borderRadius: "0" }}
    >
      <div className="flex items-center justify-between px-4 py-2 gap-4">
        {/* Left: Hamburger + Title */}
        <TopBarLeft toggleSidebar={toggleSidebar} />

        {/* Center: Search */}
        <TopBarCenter />

        {/* Right: Actions (Refresh, Theme, Notifications, Profile) */}
        <TopBarRight onRefresh={onRefresh} />
      </div>
    </header>
  );
};

export default TopBar;