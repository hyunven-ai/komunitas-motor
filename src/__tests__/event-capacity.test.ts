import { describe, it, expect } from "vitest";

interface EventCapacitySimulator {
  eventId: string;
  maxCapacity: number;
  registeredCount: number;
  participants: Set<string>;
}

function registerForEventSimulated(
  event: EventCapacitySimulator,
  memberId: string
): { success: boolean; message: string } {
  // 1. Check if already registered
  if (event.participants.has(memberId)) {
    return { success: false, message: "Anggota sudah terdaftar pada kegiatan ini." };
  }

  // 2. Strict capacity check
  if (event.registeredCount >= event.maxCapacity) {
    return { success: false, message: "Kapasitas kuota peserta touring telah penuh." };
  }

  // 3. Atomically register
  event.participants.add(memberId);
  event.registeredCount += 1;

  return { success: true, message: "Pendaftaran berhasil dikonfirmasi." };
}

describe("Event Capacity Locking & Atomic Registration", () => {
  it("allows registration when capacity is available", () => {
    const event: EventCapacitySimulator = {
      eventId: "evt-01",
      maxCapacity: 45,
      registeredCount: 44,
      participants: new Set(["m1", "m2"]),
    };

    const res = registerForEventSimulated(event, "m3");
    expect(res.success).toBe(true);
    expect(event.registeredCount).toBe(45);
    expect(event.participants.has("m3")).toBe(true);
  });

  it("strictly rejects registration when capacity is full (capacity locking)", () => {
    const event: EventCapacitySimulator = {
      eventId: "evt-01",
      maxCapacity: 45,
      registeredCount: 45,
      participants: new Set(["m1", "m2", "m3"]),
    };

    const res = registerForEventSimulated(event, "m4");
    expect(res.success).toBe(false);
    expect(res.message).toContain("penuh");
    expect(event.registeredCount).toBe(45);
    expect(event.participants.has("m4")).toBe(false);
  });

  it("prevents duplicate registration for the same member", () => {
    const event: EventCapacitySimulator = {
      eventId: "evt-01",
      maxCapacity: 50,
      registeredCount: 10,
      participants: new Set(["mem-012"]),
    };

    const res = registerForEventSimulated(event, "mem-012");
    expect(res.success).toBe(false);
    expect(res.message).toContain("sudah terdaftar");
    expect(event.registeredCount).toBe(10);
  });
});
