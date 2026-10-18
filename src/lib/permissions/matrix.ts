import { AppRole } from "@/types/database";

export type Permission =
  | "view_admin_dashboard"
  | "manage_members"
  | "approve_applications"
  | "assign_roles"
  | "manage_positions"
  | "manage_events"
  | "checkin_attendance"
  | "manage_finance"
  | "approve_payments"
  | "view_financial_reports"
  | "moderate_forum"
  | "publish_news"
  | "manage_gallery"
  | "view_audit_logs"
  | "access_member_portal"
  | "post_in_forum";

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  super_admin: [
    "view_admin_dashboard",
    "manage_members",
    "approve_applications",
    "assign_roles",
    "manage_positions",
    "manage_events",
    "checkin_attendance",
    "manage_finance",
    "approve_payments",
    "view_financial_reports",
    "moderate_forum",
    "publish_news",
    "manage_gallery",
    "view_audit_logs",
    "access_member_portal",
    "post_in_forum",
  ],
  chairman: [
    "view_admin_dashboard",
    "manage_members",
    "approve_applications",
    "manage_positions",
    "manage_events",
    "view_financial_reports",
    "moderate_forum",
    "publish_news",
    "manage_gallery",
    "view_audit_logs",
    "access_member_portal",
    "post_in_forum",
  ],
  admin: [
    "view_admin_dashboard",
    "manage_members",
    "approve_applications",
    "manage_events",
    "checkin_attendance",
    "moderate_forum",
    "publish_news",
    "manage_gallery",
    "access_member_portal",
    "post_in_forum",
  ],
  treasurer: [
    "view_admin_dashboard",
    "manage_finance",
    "approve_payments",
    "view_financial_reports",
    "access_member_portal",
    "post_in_forum",
  ],
  event_officer: [
    "view_admin_dashboard",
    "manage_events",
    "checkin_attendance",
    "access_member_portal",
    "post_in_forum",
  ],
  moderator: [
    "view_admin_dashboard",
    "moderate_forum",
    "access_member_portal",
    "post_in_forum",
  ],
  member: [
    "access_member_portal",
    "post_in_forum",
  ],
};

export function hasPermission(roles: AppRole[], permission: Permission): boolean {
  if (roles.includes("super_admin")) return true;
  return roles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
}

export function canAccessAdmin(roles: AppRole[]): boolean {
  return hasPermission(roles, "view_admin_dashboard");
}
