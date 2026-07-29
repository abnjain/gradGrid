// ============================================================================
// Core Domain Types
// ============================================================================

export type Portal = "institution" | "admin";

export type InstitutionRole =
  | "owner"
  | "admin"
  | "academic_coordinator"
  | "teacher"
  | "accountant"
  | "librarian"
  | "receptionist"
  | "hr"
  | "custom";

export type PlatformRole =
  | "super_admin"
  | "platform_admin"
  | "support_executive"
  | "customer_success"
  | "sales_executive"
  | "finance_manager"
  | "developer"
  | "devops"
  | "security_auditor";

export type UserRole = InstitutionRole | PlatformRole;

export type BadgeStatus =
  | "active"
  | "inactive"
  | "pending"
  | "danger"
  | "info"
  | "sensitive";

export type BadgePriority = "high" | "medium" | "low";

export type AvatarColor =
  | "teal"
  | "amber"
  | "rose"
  | "violet"
  | "sky"
  | "lime"
  | "orange"
  | "slate";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "danger-outline"
  | "warning"
  | "success"
  | "link";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export type CardVariant = "stat" | "detail" | "action";

export type StatCardColor = "teal" | "green" | "amber" | "red" | "info";

export type InputStatus = "default" | "error" | "success" | "loading";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

// ============================================================================
// Navigation Types
// ============================================================================

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  children?: NavItem[];
  badge?: string | number;
  comingSoon?: boolean;
  roles?: UserRole[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// ============================================================================
// User & Auth Types
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  permissions?: string[];
  institutionId?: string;
  institutionName?: string;
  sessionId?: string;
  sessionName?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============================================================================
// Common Data Types
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditEntry {
  id: string;
  action: string;
  module: string;
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: ToastVariant;
  read: boolean;
  timestamp: string;
}
