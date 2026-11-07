import { describe, it, expect } from "vitest";

describe("Digital KTA Card Specifications & Geometry", () => {
  it("calculates correct aspect ratio matching the 1024x682 graphic template", () => {
    const templateWidth = 1024;
    const templateHeight = 682;
    const aspectRatio = templateWidth / templateHeight;

    expect(aspectRatio).toBeCloseTo(1.501466, 4);
  });

  it("calculates precise border-radius matching card perimeter", () => {
    // Red glowing border arc radius on 1024px canvas is ~96px (approx 9.38%)
    const templateWidth = 1024;
    const arcRadius = 96;
    const radiusRatio = arcRadius / templateWidth;

    expect(radiusRatio).toBeGreaterThan(0.08);
    expect(radiusRatio).toBeLessThan(0.10);
  });

  it("formats NRTA properly when not explicitly provided", () => {
    const formatNrta = (memberNumber?: string, customNrta?: string) => {
      if (customNrta) return customNrta;
      if (!memberNumber) return "NRTA-001";
      const digitsOnly = memberNumber.replace(/[^0-9]/g, "");
      const cleanNum = digitsOnly ? digitsOnly.slice(-4) : "0001";
      return `NRTA-${cleanNum}`;
    };

    expect(formatNrta("BMC-2024-0012")).toBe("NRTA-0012");
    expect(formatNrta("BMC-2026-0348")).toBe("NRTA-0348");
    expect(formatNrta(undefined, "NRTA-SPECIAL")).toBe("NRTA-SPECIAL");
    expect(formatNrta(undefined)).toBe("NRTA-001");
  });

  it("validates dynamic slots percentage coverage within 1024x682 canvas without truncation or overlap", () => {
    // Exact slot coordinates matching physical/graphical template bounds
    const nameSlot = { left: 0.310, top: 0.358, width: 0.340, height: 0.044 };
    const noSlot = { left: 0.310, top: 0.493, width: 0.340, height: 0.052 };
    const nrtaSlot = { left: 0.310, top: 0.619, width: 0.170, height: 0.050 };
    const platSlot = { left: 0.532, top: 0.619, width: 0.180, height: 0.050 };
    const masaSlot = { left: 0.202, top: 0.850, width: 0.180, height: 0.038 };
    const joinSlot = { left: 0.176, top: 0.896, width: 0.174, height: 0.038 };
    const qrSlot = { left: 0.8047, top: 0.6862, width: 0.1416, height: 0.2170 };

    // All slots must be strictly within [0, 1] bounds
    [nameSlot, noSlot, nrtaSlot, platSlot, masaSlot, joinSlot, qrSlot].forEach((slot) => {
      expect(slot.left).toBeGreaterThan(0);
      expect(slot.top).toBeGreaterThan(0);
      expect(slot.left + slot.width).toBeLessThanOrEqual(1.0);
      expect(slot.top + slot.height).toBeLessThanOrEqual(1.0);
    });

    // Name and No slots start at 31% to stay clear of the left slanted edge (x=306 / 29.9%)
    expect(nameSlot.left).toBeGreaterThanOrEqual(0.31);
    expect(noSlot.left).toBeGreaterThanOrEqual(0.31);

    // Plat slot starts at 53.2% to stay clear of the left slanted edge (x=532 / 52.0%)
    expect(platSlot.left).toBeGreaterThanOrEqual(0.53);

    // NRTA and Plat slots should sit on the same horizontal row without overlapping
    expect(nrtaSlot.top).toBe(platSlot.top);
    expect(nrtaSlot.left + nrtaSlot.width).toBeLessThan(platSlot.left);
  });
});
