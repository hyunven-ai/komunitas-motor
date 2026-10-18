import { describe, it, expect } from "vitest";
import { hasPermission, canAccessAdmin } from "@/lib/permissions/matrix";
import type { AppRole } from "@/types/database";

describe("RBAC Permissions Matrix", () => {
  it("allows super_admin to have all permissions", () => {
    const roles: AppRole[] = ["super_admin"];
    expect(hasPermission(roles, "manage_members")).toBe(true);
    expect(hasPermission(roles, "approve_payments")).toBe(true);
    expect(hasPermission(roles, "checkin_attendance")).toBe(true);
    expect(hasPermission(roles, "moderate_forum")).toBe(true);
    expect(canAccessAdmin(roles)).toBe(true);
  });

  it("restricts member from administrative or financial operations", () => {
    const roles: AppRole[] = ["member"];
    expect(hasPermission(roles, "approve_payments")).toBe(false);
    expect(hasPermission(roles, "manage_members")).toBe(false);
    expect(hasPermission(roles, "manage_events")).toBe(false);
    expect(hasPermission(roles, "moderate_forum")).toBe(false);
    expect(canAccessAdmin(roles)).toBe(false);
  });

  it("permits member to access member portal and post in forum", () => {
    const roles: AppRole[] = ["member"];
    expect(hasPermission(roles, "access_member_portal")).toBe(true);
    expect(hasPermission(roles, "post_in_forum")).toBe(true);
  });

  it("allows treasurer to approve payments and view finance reports", () => {
    const roles: AppRole[] = ["treasurer"];
    expect(hasPermission(roles, "approve_payments")).toBe(true);
    expect(hasPermission(roles, "view_financial_reports")).toBe(true);
    expect(hasPermission(roles, "manage_members")).toBe(false);
    expect(canAccessAdmin(roles)).toBe(true);
  });

  it("allows event_officer to manage events and check-in attendance", () => {
    const roles: AppRole[] = ["event_officer"];
    expect(hasPermission(roles, "manage_events")).toBe(true);
    expect(hasPermission(roles, "checkin_attendance")).toBe(true);
    expect(hasPermission(roles, "approve_payments")).toBe(false);
    expect(canAccessAdmin(roles)).toBe(true);
  });

  it("allows moderator to moderate forum topics", () => {
    const roles: AppRole[] = ["moderator"];
    expect(hasPermission(roles, "moderate_forum")).toBe(true);
    expect(hasPermission(roles, "approve_payments")).toBe(false);
    expect(canAccessAdmin(roles)).toBe(true);
  });
});
