import { describe, it, expect } from "vitest";

interface SimulatedPayment {
  id: string;
  invoiceId: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
}

interface SimulatedLedgerEntry {
  id: string;
  paymentId?: string;
  type: "income" | "expense";
  amount: number;
}

function approvePaymentSimulated(
  payment: SimulatedPayment,
  ledger: SimulatedLedgerEntry[]
): { success: boolean; message: string; duplicatePrevented?: boolean } {
  // Idempotence check: if already approved, do not insert duplicate row
  if (payment.status === "approved") {
    return {
      success: true,
      message: "Pembayaran sudah disetujui sebelumnya.",
      duplicatePrevented: true,
    };
  }

  payment.status = "approved";
  ledger.push({
    id: `trx-${ledger.length + 1}`,
    paymentId: payment.id,
    type: "income",
    amount: payment.amount,
  });

  return {
    success: true,
    message: "Pembayaran berhasil disetujui dan dibukukan ke kas.",
  };
}

function computeNetCashBalance(ledger: SimulatedLedgerEntry[]): number {
  return ledger.reduce((balance, entry) => {
    return entry.type === "income" ? balance + entry.amount : balance - entry.amount;
  }, 0);
}

describe("Atomic Payment Approval & Cash Ledger Calculation", () => {
  it("approves pending payment and posts single income entry to ledger", () => {
    const payment: SimulatedPayment = {
      id: "pay-01",
      invoiceId: "inv-01",
      amount: 350000,
      status: "pending",
    };
    const ledger: SimulatedLedgerEntry[] = [];

    const res = approvePaymentSimulated(payment, ledger);
    expect(res.success).toBe(true);
    expect(payment.status).toBe("approved");
    expect(ledger.length).toBe(1);
    expect(ledger[0].amount).toBe(350000);
    expect(ledger[0].type).toBe("income");
  });

  it("is strictly idempotent: approving twice does NOT duplicate ledger rows", () => {
    const payment: SimulatedPayment = {
      id: "pay-01",
      invoiceId: "inv-01",
      amount: 350000,
      status: "pending",
    };
    const ledger: SimulatedLedgerEntry[] = [];

    // First approval
    approvePaymentSimulated(payment, ledger);
    expect(ledger.length).toBe(1);

    // Accidental second approval (retry/re-click)
    const secondRes = approvePaymentSimulated(payment, ledger);
    expect(secondRes.duplicatePrevented).toBe(true);
    expect(ledger.length).toBe(1); // Still exactly 1 row!
  });

  it("correctly derives net balance from income and expense transactions", () => {
    const ledger: SimulatedLedgerEntry[] = [
      { id: "1", type: "income", amount: 14700000 }, // Iuran registrasi
      { id: "2", type: "income", amount: 2000000 },  // Sponsor
      { id: "3", type: "expense", amount: 4800000 }, // Villa
      { id: "4", type: "expense", amount: 3200000 }, // Konsumsi
      { id: "5", type: "expense", amount: 3780000 }, // Kaos
    ];

    const net = computeNetCashBalance(ledger);
    // (14700000 + 2000000) - (4800000 + 3200000 + 3780000) = 16700000 - 11780000 = 4920000
    expect(net).toBe(4920000);
  });
});
