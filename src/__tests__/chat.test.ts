import { describe, it, expect } from "vitest";
import {
  canSendMessageInRoom,
  canDeleteMessage,
  canPinMessage,
  isChatAdmin,
  isChatModerator,
  getRoleBadgeConfig,
} from "@/modules/community-chat/utils/chat-permissions";
import {
  formatChatTimestamp,
  formatFileSize,
  getInitials,
} from "@/modules/community-chat/utils/chat-format";
import {
  DEFAULT_CHAT_ROOMS,
  groupRoomsByCategory,
} from "@/modules/community-chat/services/room.service";
import { hasPermission } from "@/lib/permissions/matrix";

describe("Community Chat - Permissions & Role Access", () => {
  it("identifies chat admins and moderators accurately", () => {
    expect(isChatAdmin("super_admin")).toBe(true);
    expect(isChatAdmin("chairman")).toBe(true);
    expect(isChatAdmin("admin")).toBe(true);
    expect(isChatAdmin("moderator")).toBe(false);
    expect(isChatAdmin("member")).toBe(false);

    expect(isChatModerator("moderator")).toBe(true);
    expect(isChatModerator("admin")).toBe(true);
    expect(isChatModerator("member")).toBe(false);
  });

  it("permits member message deletion for own messages or moderator roles", () => {
    const ownUserId = "user-123";
    const otherUserId = "user-456";

    // Own message deletion
    expect(canDeleteMessage(ownUserId, ownUserId, "member")).toBe(true);

    // Regular member cannot delete other's message
    expect(canDeleteMessage(ownUserId, otherUserId, "member")).toBe(false);

    // Moderator can delete other's message
    expect(canDeleteMessage(ownUserId, otherUserId, "moderator")).toBe(true);
    expect(canDeleteMessage(ownUserId, otherUserId, "admin")).toBe(true);
  });

  it("handles read-only channel and mute/ban restrictions", () => {
    // Normal channel - active member allowed
    const normalCheck = canSendMessageInRoom({
      roles: "member",
      isRoomReadOnly: false,
    });
    expect(normalCheck.allowed).toBe(true);

    // Read-only channel (e.g., #announcements) - regular member blocked
    const readOnlyMember = canSendMessageInRoom({
      roles: "member",
      isRoomReadOnly: true,
    });
    expect(readOnlyMember.allowed).toBe(false);
    expect(readOnlyMember.reason).toContain("Read-Only");

    // Read-only channel - admin allowed
    const readOnlyAdmin = canSendMessageInRoom({
      roles: "admin",
      isRoomReadOnly: true,
    });
    expect(readOnlyAdmin.allowed).toBe(true);

    // Muted member blocked
    const mutedCheck = canSendMessageInRoom({
      roles: "member",
      isMuted: true,
    });
    expect(mutedCheck.allowed).toBe(false);
    expect(mutedCheck.reason).toContain("mute");

    // Banned member blocked
    const bannedCheck = canSendMessageInRoom({
      roles: "member",
      isBanned: true,
    });
    expect(bannedCheck.allowed).toBe(false);
    expect(bannedCheck.reason).toContain("penangguhan");
  });

  it("provides distinctive role badges for biker hierarchy", () => {
    const chairmanBadge = getRoleBadgeConfig("chairman");
    expect(chairmanBadge.label).toBe("PENGURUS UTAMA");
    expect(chairmanBadge.colorHex).toBe("#EF4444");

    const modBadge = getRoleBadgeConfig("moderator");
    expect(modBadge.label).toBe("MODERATOR");

    const memberBadge = getRoleBadgeConfig("member");
    expect(memberBadge.label).toBe("MEMBER RESMI");
  });

  it("integrates with main permissions matrix", () => {
    expect(hasPermission(["member"], "access_chat")).toBe(true);
    expect(hasPermission(["member"], "manage_chat")).toBe(false);
    expect(hasPermission(["admin"], "manage_chat")).toBe(true);
  });
});

describe("Community Chat - Formatting & Utilities", () => {
  it("formats relative chat timestamps", () => {
    const nowIso = new Date().toISOString();
    const formatted = formatChatTimestamp(nowIso);
    expect(formatted).toContain("Hari ini pukul");

    const olderIso = "2025-01-15T10:30:00Z";
    const olderFormatted = formatChatTimestamp(olderIso);
    expect(olderFormatted).toContain("15 Jan 2025");
  });

  it("formats file sizes cleanly", () => {
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(1024 * 50)).toBe("50 KB");
    expect(formatFileSize(1024 * 1024 * 3.5)).toBe("3.5 MB");
  });

  it("extracts member initials correctly", () => {
    expect(getInitials("Bambang Pamungkas")).toBe("BP");
    expect(getInitials("Hendra")).toBe("HE");
    expect(getInitials("")).toBe("BM");
  });
});

describe("Community Chat - Room Categories & Defaults", () => {
  it("contains pre-seeded community, riding & events, and chapters channels", () => {
    expect(DEFAULT_CHAT_ROOMS.length).toBeGreaterThanOrEqual(10);

    const slugs = DEFAULT_CHAT_ROOMS.map((r) => r.slug);
    expect(slugs).toContain("general");
    expect(slugs).toContain("introductions");
    expect(slugs).toContain("announcements");
    expect(slugs).toContain("touring");
    expect(slugs).toContain("pontianak");
  });

  it("groups rooms by category correctly", () => {
    const grouped = groupRoomsByCategory(DEFAULT_CHAT_ROOMS);
    expect(grouped.COMMUNITY.length).toBeGreaterThanOrEqual(4);
    expect(grouped["RIDING & EVENTS"].length).toBeGreaterThanOrEqual(4);
    expect(grouped.CHAPTERS.length).toBeGreaterThanOrEqual(3);
  });
});

