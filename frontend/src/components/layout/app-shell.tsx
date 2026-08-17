"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserPlus,
  BookOpen,
  ClipboardCheck,
  FileSpreadsheet,
  DollarSign,
  Library,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  ShieldAlert,
  ChevronDown,
  Building2,
  School,
  UserCog,
  UserCircle,
  LogOut,
  Menu,
  X,
  // Search,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
import { useAuth } from "@/lib/auth-context";

/* ─── Types ─── */
export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  comingSoon?: boolean;
  children?: NavItem[];
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

/* ─── Institution Portal Navigation ─── */
const institutionNav: NavGroup[] = [
  { items: [{ label: "Dashboard", href: "/app/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, comingSoon: false }] },
  {
    label: "PEOPLE",
    items: [
      { label: "Students", href: "/app/students", icon: <GraduationCap className="w-4 h-4" />, comingSoon: false },
      { label: "Teachers", href: "/app/teachers", icon: <Users className="w-4 h-4" />, comingSoon: false },
      { label: "Parents", href: "/app/parents", icon: <Users className="w-4 h-4" />, comingSoon: false },
      { label: "Users", href: "/app/users", icon: <UserCog className="w-4 h-4" />, comingSoon: false },
    ],
  },
  {
    label: "ADMISSIONS",
    items: [
      { label: "Admissions", href: "/app/admissions", icon: <UserPlus className="w-4 h-4" />, comingSoon: true },
    ],
  },
  {
    label: "ACADEMICS",
    items: [
      { label: "Academic Structure", href: "/app/academics", icon: <BookOpen className="w-4 h-4" />, comingSoon: true },
      { label: "Attendance", href: "/app/attendance", icon: <ClipboardCheck className="w-4 h-4" />, comingSoon: true },
      { label: "Examination", href: "/app/examination", icon: <FileSpreadsheet className="w-4 h-4" />, comingSoon: true },
    ],
  },
  {
    label: "FINANCE",
    items: [
      { label: "Finance", href: "/app/finance", icon: <DollarSign className="w-4 h-4" />, comingSoon: true },
    ],
  },
  {
    label: "SERVICES",
    items: [
      { label: "Library", href: "/app/library", icon: <Library className="w-4 h-4" />, comingSoon: true },
      { label: "Communication", href: "/app/communication", icon: <MessageSquare className="w-4 h-4" />, comingSoon: true },
      { label: "Documents", href: "/app/documents", icon: <FileText className="w-4 h-4" />, comingSoon: true },
    ],
  },
  {
    label: "INSIGHTS",
    items: [
      { label: "Reports", href: "/app/reports", icon: <BarChart3 className="w-4 h-4" />, comingSoon: true },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { label: "Settings", href: "/app/settings", icon: <Settings className="w-4 h-4" />, comingSoon: false },
      { label: "Audit Logs", href: "/app/audit-logs", icon: <ShieldAlert className="w-4 h-4" />, comingSoon: false },
    ],
  },
];

/* ─── Platform Admin Navigation ─── */
const adminNav: NavGroup[] = [
  { items: [{ label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> }] },
  {
    items: [
      { label: "Organizations", href: "/admin/organizations", icon: <Building2 className="w-4 h-4" /> },
      { label: "Institutions", href: "/admin/institutions", icon: <School className="w-4 h-4" /> },
    ],
  },
  {
    items: [
      { label: "Platform Users", href: "/admin/users", icon: <UserCog className="w-4 h-4" /> },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { label: "Audit Logs", href: "/admin/audit-logs", icon: <ShieldAlert className="w-4 h-4" /> },
      { label: "Configuration", href: "/admin/configuration", icon: <Settings className="w-4 h-4" /> },
    ],
  },
  {
    items: [
      { label: "My Account", href: "/admin/account", icon: <UserCircle className="w-4 h-4" /> },
    ],
  },
];

/* ─── Sidebar ─── */
interface SidebarProps {
  nav: NavGroup[];
  type: "institution" | "admin";
  institutionName?: string;
  sessionName?: string;
  onClose?: () => void;
  onCollapse?: () => void;
}

function Sidebar({ nav, type, institutionName, sessionName, onClose, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    onClose?.();
    await logout();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/app/dashboard" || href === "/admin/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[260px] h-screen bg-[#111827] flex flex-col flex-shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] bg-brand rounded-[7px] flex items-center justify-center">
            <span className="text-white text-sm font-bold font-display">G</span>
          </div>
          <span className="font-display font-bold text-white text-[15px] tracking-tight">GradGrid</span>
        </div>
        <div className="flex items-center gap-1">
          {onCollapse && (
            <button
              onClick={onCollapse}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className="hidden lg:inline-flex w-7 h-7 items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="text-white/50 hover:text-white lg:hidden">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Institution context */}
      {type === "institution" && (
        <div className="px-4 pb-3">
          <div className="bg-white/5 rounded-lg px-3 py-2.5 border border-white/5">
            <p className="text-[11px] text-white/40 font-medium truncate">{institutionName || "Institution"}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-white/80 font-semibold truncate">{sessionName || "Session"}</span>
              <ChevronDown className="w-3 h-3 text-white/40 flex-shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 pb-4">
        {nav.map((group, gi) => (
          <div key={gi} className="mb-1">
            {group.label && (
              <p className="px-3 pt-4 pb-1.5 text-[10px] font-bold text-white/30 uppercase tracking-[1.2px]">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    // Only navigate when the module is available — otherwise block it
                    if (item.comingSoon) {
                      e.preventDefault();
                      return;
                    }
                    onClose?.();
                  }}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-sm transition-all duration-[0.14s] no-underline group relative",
                    active
                      ? "bg-brand/15 text-brand-mid font-semibold"
                      : "text-white/65 hover:bg-white/5 hover:text-white/85"
                  )}
                >
                  <span className={cn("flex-shrink-0", active ? "text-brand-mid" : "text-white/40")}>
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && <Badge variant="count">{item.badge}</Badge>}
                  {item.comingSoon && (
                    <span className="text-[8px] font-bold uppercase tracking-wider text-accent-mid bg-accent/10 px-1 py-[1px] rounded-full">
                      Soon
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 pt-2 border-t border-white/5">
        <Link
          href={type === "institution" ? "/app/account" : "/admin/account"}
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-sm text-white/65 hover:bg-white/5 hover:text-white/85 transition-all no-underline"
        >
          <UserCircle className="w-4 h-4 text-white/40 flex-shrink-0" />
          <span className="flex-1 truncate">My Account</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-[9px] rounded-lg text-sm text-white/65 hover:bg-white/5 hover:text-white/85 transition-all no-underline"
        >
          <LogOut className="w-4 h-4 text-white/40 flex-shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

/* ─── Header ─── */
interface HeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
  onMenuClick: () => void;
  onExpandSidebar?: () => void;
}

function Header({ breadcrumbs, onMenuClick, onExpandSidebar }: HeaderProps) {
  const { user } = useAuth();
  const displayName = user?.name?.trim() || user?.email || "Account";

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        {onExpandSidebar && (
          <button
            onClick={onExpandSidebar}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            className="hidden lg:inline-flex w-8 h-8 items-center justify-center rounded-md text-mid hover:bg-surface-raised transition-colors"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md text-mid hover:bg-surface-raised transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-mist flex-shrink-0" />}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-mid hover:text-charcoal transition-colors no-underline"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-ink font-semibold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <div className="w-px h-5 bg-border mx-1" />
        {/* <button className="w-8 h-8 flex items-center justify-center rounded-md text-mid hover:bg-surface-raised transition-colors relative">
          <Search className="w-4 h-4" />
        </button> */}
        <NotificationsDropdown />
        <div className="w-px h-5 bg-border mx-1" />
        <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-surface-raised transition-colors">
          <Avatar name={displayName} size="sm" />
          <span className="text-sm text-charcoal font-medium hidden sm:inline">{displayName}</span>
        </button>
      </div>
    </header>
  );
}

/* ─── AppShell ─── */
interface AppShellProps {
  children: React.ReactNode;
  type: "institution" | "admin";
  breadcrumbs?: { label: string; href?: string }[];
  institutionName?: string;
  sessionName?: string;
}

function AppShell({ children, type, breadcrumbs, institutionName, sessionName }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = React.useState(false);
  const nav = type === "institution" ? institutionNav : adminNav;

  return (
    <div className="flex h-screen overflow-hidden bg-fog">
      {/* Desktop sidebar */}
      {!desktopCollapsed && (
        <div className="hidden lg:flex">
          <Sidebar
            nav={nav}
            type={type}
            institutionName={institutionName}
            sessionName={sessionName}
            onCollapse={() => setDesktopCollapsed(true)}
          />
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-[#111827]/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 z-50 animate-slide-in-right">
            <Sidebar
              nav={nav}
              type={type}
              institutionName={institutionName}
              sessionName={sessionName}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          breadcrumbs={breadcrumbs}
          onMenuClick={() => setSidebarOpen(true)}
          onExpandSidebar={desktopCollapsed ? () => setDesktopCollapsed(false) : undefined}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export { AppShell, Sidebar, Header, institutionNav, adminNav };
