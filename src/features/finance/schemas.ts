import { z } from "zod";

export const paymentSubmissionSchema = z.object({
  invoiceId: z.string().min(1, "ID Invoice harus diisi"),
  bankName: z.string().min(2, "Nama bank pengirim harus diisi (cth: BCA, Mandiri, BRI, BNI)"),
  accountName: z.string().min(3, "Nama pemilik rekening pengirim harus diisi"),
  amount: z.number().min(10000, "Nominal transfer minimal Rp 10.000"),
  proofUrl: z.string().min(1, "Bukti transfer harus diunggah"),
  notes: z.string().optional(),
});

export type PaymentSubmissionInput = z.infer<typeof paymentSubmissionSchema>;

export const manualTransactionSchema = z.object({
  accountId: z.string().min(1, "Akun kas harus dipilih"),
  type: z.enum(["income", "expense"]),
  amount: z.number().min(1000, "Nominal minimal Rp 1.000"),
  category: z.string().min(3, "Kategori transaksi harus diisi"),
  description: z.string().min(5, "Deskripsi pengeluaran/pemasukan harus jelas"),
  referenceNumber: z.string().optional(),
});

export type ManualTransactionInput = z.infer<typeof manualTransactionSchema>;
