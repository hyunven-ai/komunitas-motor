import { AppRole } from "@/types/database";

export function isChatAdmin(roles: AppRole[] | AppRole): boolean {
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.some((r) => ["super_admin", "chairman", "admin"].includes(r));
}

export function isChatModerator(roles: AppRole[] | AppRole): boolean {
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.some((r) =>
    ["super_admin", "chairman", "admin", "moderator"].includes(r)
  );
}

export function canCreateRoom(roles: AppRole[] | AppRole): boolean {
  return isChatAdmin(roles);
}

export function canDeleteMessage(
  currentUserId: string,
  messageSenderId: string,
  roles: AppRole[] | AppRole
): boolean {
  if (currentUserId === messageSenderId) return true;
  return isChatModerator(roles);
}

export function canEditMessage(
  currentUserId: string,
  messageSenderId: string
): boolean {
  return currentUserId === messageSenderId;
}

export function canPinMessage(roles: AppRole[] | AppRole): boolean {
  return isChatModerator(roles);
}

export function canSendMessageInRoom({
  roles,
  isRoomReadOnly = false,
  isMuted = false,
  isBanned = false,
}: {
  roles: AppRole[] | AppRole;
  isRoomReadOnly?: boolean;
  isMuted?: boolean;
  isBanned?: boolean;
}): { allowed: boolean; reason?: string } {
  if (isBanned) {
    return {
      allowed: false,
      reason: "Akun Anda sedang dalam masa penangguhan (banned) dari chat komunitas.",
    };
  }

  if (isMuted) {
    return {
      allowed: false,
      reason: "Anda sedang dalam status mute oleh moderator. Anda hanya dapat membaca percakapan.",
    };
  }

  if (isRoomReadOnly && !isChatAdmin(roles)) {
    return {
      allowed: false,
      reason: "Channel ini berstatus pengumuman resmi (Read-Only) dan hanya dapat diisi oleh Dewan Pengurus.",
    };
  }

  return { allowed: true };
}

export function getRoleBadgeConfig(role: AppRole): {
  label: string;
  badgeClass: string;
  colorHex: string;
} {
  switch (role) {
    case "super_admin":
    case "chairman":
      return {
        label: "PENGURUS UTAMA",
        badgeClass: "bg-red-500/20 text-red-400 border-red-500/40",
        colorHex: "#EF4444",
      };
    case "admin":
      return {
        label: "ADMIN BROTHERHOOD",
        badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/40",
        colorHex: "#F59E0B",
      };
    case "moderator":
      return {
        label: "MODERATOR",
        badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/40",
        colorHex: "#3B82F6",
      };
    case "event_officer":
      return {
        label: "ROAD CAPTAIN / EVENT",
        badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
        colorHex: "#10B981",
      };
    case "treasurer":
      return {
        label: "BENDAHARA",
        badgeClass: "bg-purple-500/20 text-purple-400 border-purple-500/40",
        colorHex: "#8B5CF6",
      };
    case "member":
    default:
      return {
        label: "MEMBER RESMI",
        badgeClass: "bg-zinc-800 text-bone-muted border-zinc-700",
        colorHex: "#9E9EA8",
      };
  }
}

