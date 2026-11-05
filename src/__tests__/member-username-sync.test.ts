import { describe, it, expect } from "vitest";

function resolveMemberUsername(params: {
  profileUsername?: string | null;
  applicationUsername?: string | null;
  reasonToJoin?: string | null;
  authMetadataUsername?: string | null;
  email?: string | null;
  fullName?: string | null;
}): string {
  const raw =
    params.profileUsername ||
    params.applicationUsername ||
    (params.reasonToJoin?.match(/\[Username:\s*([^\]]+)\]/)?.[1]) ||
    params.authMetadataUsername ||
    (params.email ? params.email.split("@")[0] : null) ||
    (params.fullName ? params.fullName.toLowerCase().replace(/\s+/g, "_") : "member");

  return raw.toLowerCase().replace(/[^a-z0-9_]/g, "");
}

describe("Member Username Synchronization & Resolution", () => {
  it("prioritizes explicit profile username if present", () => {
    const res = resolveMemberUsername({
      profileUsername: "borneo_rider",
      applicationUsername: "app_rider",
      email: "test@example.com",
    });
    expect(res).toBe("borneo_rider");
  });

  it("falls back to application username if profile username is empty", () => {
    const res = resolveMemberUsername({
      profileUsername: null,
      applicationUsername: "jokowi_rider",
      email: "testing@gmail.com",
    });
    expect(res).toBe("jokowi_rider");
  });

  it("extracts username embedded in reason_to_join for legacy registrations", () => {
    const res = resolveMemberUsername({
      profileUsername: null,
      applicationUsername: null,
      reasonToJoin: "Ingin touring bareng kawan-kawan [Username: rider_pontianak]",
      email: "user@borneobikers.com",
    });
    expect(res).toBe("rider_pontianak");
  });

  it("falls back to auth user metadata if neither profile nor application has username", () => {
    const res = resolveMemberUsername({
      profileUsername: null,
      applicationUsername: null,
      reasonToJoin: null,
      authMetadataUsername: "auth_jokowi",
      email: "testing@gmail.com",
    });
    expect(res).toBe("auth_jokowi");
  });

  it("falls back to email prefix when no username was provided", () => {
    const res = resolveMemberUsername({
      profileUsername: null,
      applicationUsername: null,
      reasonToJoin: null,
      authMetadataUsername: null,
      email: "agus.permana@bikers.id",
    });
    expect(res).toBe("aguspermana");
  });

  it("sanitizes username to lowercase alphanumeric and underscore only", () => {
    const res = resolveMemberUsername({
      profileUsername: "Biker-Pro#2026!",
    });
    expect(res).toBe("bikerpro2026");
  });
});

