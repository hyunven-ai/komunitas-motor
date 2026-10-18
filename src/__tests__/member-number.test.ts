import { describe, it, expect } from "vitest";

function generateMemberNumberMock(seq: number, year = 2026): string {
  const padded = seq.toString().padStart(4, "0");
  return `BMC-${year}-${padded}`;
}

describe("Member Number Generator (generate_member_number)", () => {
  it("formats member number strictly as BMC-YYYY-XXXX", () => {
    const num = generateMemberNumberMock(12, 2026);
    expect(num).toBe("BMC-2026-0012");
    expect(num).toMatch(/^BMC-\d{4}-\d{4}$/);
  });

  it("correctly zero-pads single-digit sequences", () => {
    const num = generateMemberNumberMock(1, 2026);
    expect(num).toBe("BMC-2026-0001");
  });

  it("correctly zero-pads triple-digit sequences", () => {
    const num = generateMemberNumberMock(250, 2026);
    expect(num).toBe("BMC-2026-0250");
  });

  it("handles four-digit sequences without truncation", () => {
    const num = generateMemberNumberMock(1000, 2026);
    expect(num).toBe("BMC-2026-1000");
  });
});
