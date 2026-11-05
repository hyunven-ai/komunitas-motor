import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  calculateLevenshteinDistance,
  findTypoCorrection,
  COMMUNITY_KEYWORDS,
} from "@/lib/states/fuzzy-search";
import { classifyError } from "@/lib/states/error-classifier";
import { DraftStorage } from "@/lib/states/draft-storage";
import { FIELD_FIX_TIPS } from "@/components/states/form-validation-state";

describe("10 States Architecture - Logic & Engines", () => {
  describe("State 6: Fuzzy Search & Typo Detection Engine", () => {
    it("computes zero distance for identical words", () => {
      expect(calculateLevenshteinDistance("touring", "touring")).toBe(0);
      expect(calculateLevenshteinDistance("Bromo", "bromo")).toBe(0);
    });

    it("identifies typo and suggests closest community keyword", () => {
      // User typed "trouring" with typo
      const res1 = findTypoCorrection("trouring");
      expect(res1.hasTypo).toBe(true);
      expect(res1.suggestedQuery).toBe("Touring");

      // User typed "kopdr"
      const res2 = findTypoCorrection("kopdr");
      expect(res2.hasTypo).toBe(true);
      expect(res2.suggestedQuery).toBe("Kopdar");

      // User typed "angota"
      const res3 = findTypoCorrection("angota");
      expect(res3.hasTypo).toBe(true);
      expect(res3.suggestedQuery).toBe("Anggota");
    });

    it("provides popular suggestion chips when no exact match exists", () => {
      const res = findTypoCorrection("xyznonexistentword99");
      expect(res.suggestedKeywords.length).toBeGreaterThan(0);
    });
  });

  describe("State 3: Error Classifier (What Went Wrong, Whose Fault, How To Fix)", () => {
    it("classifies network errors to client connection fault", () => {
      const error = new Error("Failed to fetch user profile: NetworkError");
      const classified = classifyError(error);

      expect(classified.fault).toBe("network");
      expect(classified.faultParty).toContain("Koneksi Jaringan");
      expect(classified.howToFix.steps.length).toBeGreaterThan(0);
      expect(classified.howToFix.actionLabel).toBe("Coba Lagi");
    });

    it("classifies authentication/session errors to auth key expiration", () => {
      const error = new Error("401 Unauthorized: JWT expired");
      const classified = classifyError(error);

      expect(classified.fault).toBe("auth");
      expect(classified.statusCode).toBe(401);
      expect(classified.howToFix.actionLabel).toBe("Masuk Kembali");
    });

    it("classifies validation errors to user input mismatch", () => {
      const error = new Error("Validation error: NIK KTP format salah");
      const classified = classifyError(error);

      expect(classified.fault).toBe("user");
      expect(classified.faultParty).toContain("Isian Formulir");
      expect(classified.howToFix.actionLabel).toBe("Periksa Formulir");
    });

    it("classifies server exceptions to internal system fault (not user's fault)", () => {
      const error = new Error("PostgreSQL connection timeout 500");
      const classified = classifyError(error);

      expect(classified.fault).toBe("server");
      expect(classified.faultParty).toContain("Bukan Perangkat Anda");
      expect(classified.howToFix.actionLabel).toBe("Muat Ulang Halaman");
    });
  });

  describe("State 8: Draft Storage (Save Work Before Sign Out)", () => {
    let mockStore: Record<string, string> = {};

    beforeEach(() => {
      mockStore = {};
      const mockLocalStorage = {
        getItem: vi.fn((key: string) => mockStore[key] || null),
        setItem: vi.fn((key: string, val: string) => {
          mockStore[key] = val;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockStore[key];
        }),
        clear: vi.fn(() => {
          mockStore = {};
        }),
        get length() {
          return Object.keys(mockStore).length;
        },
        key: vi.fn((idx: number) => Object.keys(mockStore)[idx] || null),
      };

      // Mock window and localStorage
      vi.stubGlobal("window", {
        localStorage: mockLocalStorage,
        location: { pathname: "/join", search: "" },
      });
    });

    it("saves and retrieves form draft correctly with timestamp and TTL", () => {
      const payload = {
        fullName: "Agus Bikers",
        motor: "CB500X",
      };

      const saved = DraftStorage.save("test_form_01", payload, "Draf Calon Member");
      expect(saved).not.toBeNull();
      expect(saved?.formId).toBe("test_form_01");

      const retrieved = DraftStorage.get<typeof payload>("test_form_01");
      expect(retrieved).not.toBeNull();
      expect(retrieved?.data.fullName).toBe("Agus Bikers");
      expect(retrieved?.data.motor).toBe("CB500X");
    });

    it("removes draft upon submission cleanup", () => {
      DraftStorage.save("form_cleanup_test", { note: "test" });
      expect(DraftStorage.has("form_cleanup_test")).toBe(true);

      DraftStorage.remove("form_cleanup_test");
      expect(DraftStorage.has("form_cleanup_test")).toBe(false);
    });
  });

  describe("State 9: Form Validation Field Remediation Tips", () => {
    it("contains actionable resolution instructions for essential form fields including username", () => {
      expect(FIELD_FIX_TIPS.username.rule).toContain("Username");
      expect(FIELD_FIX_TIPS.username.example).toContain("rider_borneo");

      expect(FIELD_FIX_TIPS.phoneNumber.rule).toContain("WhatsApp");
      expect(FIELD_FIX_TIPS.phoneNumber.example).toContain("08");

      expect(FIELD_FIX_TIPS.idCardNumber.rule).toContain("16 digit");
      expect(FIELD_FIX_TIPS.email.rule).toContain("email");
      expect(FIELD_FIX_TIPS.motorcyclePlate.rule).toContain("plat");
    });
  });

  describe("Membership Application Schema: Username Validation", () => {
    it("validates username rules correctly", async () => {
      const { membershipApplicationSchema } = await import("@/features/membership/schemas");

      const basePayload = {
        fullName: "Bambang Pamungkas",
        email: "bambang@brotherhood.id",
        phoneNumber: "081234567890",
        city: "Balikpapan",
        motorcycleModel: "Honda CB500X",
        motorcyclePlate: "KT 1234 ABC",
        motorcycleYear: 2024,
        emergencyContactName: "Siti Rahma",
        emergencyContactPhone: "081399887766",
        reasonToJoin: "Touring silaturahmi",
      };

      // Valid username
      const validRes = membershipApplicationSchema.safeParse({
        ...basePayload,
        username: "biker_borneo01",
      });
      expect(validRes.success).toBe(true);
      if (validRes.success) {
        expect(validRes.data.username).toBe("biker_borneo01");
      }

      // Username too short (< 3 chars)
      const shortRes = membershipApplicationSchema.safeParse({
        ...basePayload,
        username: "ab",
      });
      expect(shortRes.success).toBe(false);

      // Username with spaces or invalid special characters
      const spaceRes = membershipApplicationSchema.safeParse({
        ...basePayload,
        username: "biker borneo!",
      });
      expect(spaceRes.success).toBe(false);
    });
  });
});

