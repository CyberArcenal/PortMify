// src/layouts/components/TopBarRight.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, RefreshCw, User, LogOut, Settings, Sun, Moon } from "lucide-react";
import notificationAPI from "@/api/core/notification";
import Button from "@/components/UI/Button";
import { NotificationDrawer } from "@/components/Shared/NotificationDrawer";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/lib/auth";

interface TopBarRightProps {
  onRefresh?: () => void;
}

const TopBarRight: React.FC<TopBarRightProps> = ({ onRefresh }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.list({ page: 1, page_size: 100 });
      const unread = response.results.filter((n) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch unread count", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const handleDrawerClose = () => {
    setIsNotificationOpen(false);
    fetchUnreadCount();
  };

  const handleUnreadCountChange = (count: number) => {
    setUnreadCount(count);
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "?";
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    return user.username?.charAt(0).toUpperCase() || "?";
  };

  // Get user display name
  const getDisplayName = () => {
    if (!user) return "User";
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) return firstName;
    return user.username || "User";
  };

  // Get user email
  const getUserEmail = () => {
    return user?.email || "user@portfolio.com";
  };

  // Get role display
  const getRoleDisplay = () => {
    if (!user) return "";
    const roleMap: Record<string, string> = {
      admin: "Administrator",
      manager: "Manager",
      staff: "Staff",
      customer: "Customer",
      viewer: "Viewer",
    };
    return roleMap[user.user_type] || user.user_type || "";
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Refresh Button */}
        <Button
          onClick={handleRefresh}
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          iconPosition="left"
          className="hidden sm:flex"
        >
          Refresh
        </Button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-[var(--card-secondary-bg)] text-[var(--sidebar-text)] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationOpen(true)}
            aria-label="Notifications"
            className="relative p-2 rounded-lg hover:bg-[var(--card-secondary-bg)] text-[var(--sidebar-text)] transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-[var(--danger-color)] text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--card-secondary-bg)] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white text-sm font-medium">
              {getUserInitials()}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-lg overflow-hidden z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--card-secondary-bg)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white text-sm font-medium">
                    {getUserInitials()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {getUserEmail()}
                    </p>
                    {getRoleDisplay() && (
                      <span className="inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
                        {getRoleDisplay()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => { navigate("/profile"); setShowProfileMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] flex items-center gap-3 transition-colors"
                >
                  <User className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span>My Profile</span>
                </button>
                <hr className="border-[var(--border-color)] mx-3" />
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-[var(--danger-color)] hover:bg-[var(--danger-color)]/10 flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={handleDrawerClose}
        onUnreadCountChange={handleUnreadCountChange}
      />
    </>
  );
};

export default TopBarRight;