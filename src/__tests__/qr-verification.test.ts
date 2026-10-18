import { describe, it, expect } from "vitest";

interface FullMemberRecord {
  id: string;
  fullName: string;
  memberNumber: string;
  status: "active" | "inactive" | "suspended";
  chapter: string;
  idCardNumber: string; // NIK
  drivingLicenseNumber: string; // SIM C
  phone: string;
  emergencyContact: string;
  qrTokenHash: string;
  tokenExpiresAt: number;
}

interface PublicVerificationResponse {
  valid: boolean;
  memberNumber?: string;
  fullName?: string;
  status?: string;
  chapter?: string;
  error?: string;
}

function verifyMemberCardPublic(
  token: string,
  database: FullMemberRecord[]
): PublicVerificationResponse {
  const member = database.find((m) => m.qrTokenHash === token);

  if (!member) {
    return { valid: false, error: "Token KTA tidak terdaftar atau telah direset." };
  }

  if (Date.now() > member.tokenExpiresAt) {
    return { valid: false, error: "Token KTA digital telah kedaluwarsa." };
  }

  // Returns ONLY minimal non-sensitive PII per privacy & security specification
  return {
    valid: true,
    memberNumber: member.memberNumber,
    fullName: member.fullName,
    status: member.status.toUpperCase(),
    chapter: member.chapter,
  };
}

describe("Digital KTA Secure QR Verification", () => {
  const sampleMembers: FullMemberRecord[] = [
    {
      id: "mem-01",
      fullName: "Bambang Wijaya",
      memberNumber: "BMC-2026-0012",
      status: "active",
      chapter: "Chapter Jawa Barat (Bogor)",
      idCardNumber: "3201123456780001",
      drivingLicenseNumber: "SIM-C-98765432",
      phone: "+6281234567890",
      emergencyContact: "Dewi (Istri) - 081299998888",
      qrTokenHash: "valid_hash_token_abc123",
      tokenExpiresAt: Date.now() + 86400000, // Valid for 24 hours
    },
    {
      id: "mem-02",
      fullName: "Alm. Rudianto",
      memberNumber: "BMC-2026-0005",
      status: "suspended",
      chapter: "Chapter DKI Jakarta",
      idCardNumber: "3171123456780002",
      drivingLicenseNumber: "SIM-C-11223344",
      phone: "+628111222333",
      emergencyContact: "Keluarga",
      qrTokenHash: "expired_hash_token_xyz999",
      tokenExpiresAt: Date.now() - 3600000, // Expired 1 hour ago
    },
  ];

  it("verifies a valid token and discloses only safe non-sensitive data", () => {
    const res = verifyMemberCardPublic("valid_hash_token_abc123", sampleMembers);
    expect(res.valid).toBe(true);
    expect(res.memberNumber).toBe("BMC-2026-0012");
    expect(res.fullName).toBe("Bambang Wijaya");
    expect(res.status).toBe("ACTIVE");
    expect(res.chapter).toBe("Chapter Jawa Barat (Bogor)");

    // Crucial Security Verification: Sensitive PII MUST NOT be present
    expect((res as unknown as Record<string, unknown>).idCardNumber).toBeUndefined();
    expect((res as unknown as Record<string, unknown>).drivingLicenseNumber).toBeUndefined();
    expect((res as unknown as Record<string, unknown>).phone).toBeUndefined();
    expect((res as unknown as Record<string, unknown>).emergencyContact).toBeUndefined();
  });

  it("rejects expired QR tokens with safe error message", () => {
    const res = verifyMemberCardPublic("expired_hash_token_xyz999", sampleMembers);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("kedaluwarsa");
  });

  it("rejects forged or tampered tokens", () => {
    const res = verifyMemberCardPublic("forged_fake_token_123", sampleMembers);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("tidak terdaftar");
  });
});
