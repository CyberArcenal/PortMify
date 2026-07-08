
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Mail,
  Users,
  Settings,
  Star,
  User,
  Code,
  BookOpen,
  Send,
  BarChart3,
  MailOpen,
  Layers,
  FolderTree,
  BellElectricIcon,
  Image,
  Award,
  Cpu,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MenuItem {
  path: string;
  name: string;
  icon: LucideIcon;
  category?: string;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  // ─── Dashboard ──────────────────────────────────
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
    category: "dashboard",
  },

  // ─── Blog ───────────────────────────────────────
  {
    path: "",
    name: "Blog",
    icon: BookOpen,
    category: "content",
    children: [
      { path: "/blog", name: "All Posts", icon: FileText },
      { path: "/blog/categories", name: "Categories", icon: FolderTree },
      { path: "/blog/comments", name: "Comments", icon: MessageSquare },
    ],
  },

  // ─── Projects ───────────────────────────────────
  {
    path: "",
    name: "Projects",
    icon: FolderOpen,
    category: "content",
    children: [
      { path: "/projects", name: "All Projects", icon: Layers },
      { path: "/projects/features", name: "Features", icon: Star },
      { path: "/projects/gallery", name: "Gallery", icon: Image },
      { path: "/projects/tech-stack", name: "Tech Stack", icon: Cpu },
    ],
  },

  // ─── Testimonials ──────────────────────────────
  {
    path: "/testimonials",
    name: "Testimonials",
    icon: Award,
    category: "content",
  },

  // ─── Profile & Skills ──────────────────────────
  {
    path: "/profile",
    name: "Profile",
    icon: User,
    category: "profile",
  },
  {
    path: "/skills",
    name: "Skills",
    icon: Code,
    category: "profile",
  },
  {
    path: "/experience",
    name: "Experience",
    icon: Briefcase,
    category: "profile",
  },
  {
    path: "/education",
    name: "Education",
    icon: GraduationCap,
    category: "profile",
  },

  // ─── Engagement ────────────────────────────────
  {
    path: "/subscribers",
    name: "Subscribers",
    icon: Mail,
    category: "engagement",
  },
  {
    path: "/contact-messages",
    name: "Contact Messages",
    icon: Send,
    category: "engagement",
  },

  // ─── System ─────────────────────────────────────
  {
    path: "",
    name: "System",
    icon: Settings,
    category: "system",
    children: [
      { path: "/stats", name: "Statistics", icon: BarChart3 },
      { path: "/notify-logs", name: "Notify Logs", icon: BellElectricIcon },
      { path: "/email-templates", name: "Email Templates", icon: MailOpen },
      { path: "/users", name: "Users", icon: Users },
    ],
  },
];

export const categories = [
  { id: "dashboard", name: "Dashboard" },
  { id: "content", name: "Content Management" },
  { id: "profile", name: "Profile & Skills" },
  { id: "engagement", name: "Engagement" },
  { id: "system", name: "System" },
];