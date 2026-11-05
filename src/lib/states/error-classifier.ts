/**
 * Error Classifier & Remediation Assistant
 * Analyzes exceptions, HTTP codes, and error payloads to establish:
 * 1. What went wrong (clear human-readable issue)
 * 2. Whose fault it is (server/system, network, or user input)
 * 3. How to fix it (concrete step-by-step resolution)
 */

export type FaultAttribution = "server" | "network" | "user" | "auth" | "unknown";

export interface ClassifiedError {
  whatWentWrong: string;
  fault: FaultAttribution;
  faultParty: string; // e.g., "Kesalahan Server Kami", "Koneksi Perangkat Anda", "Ketidaksesuaian Formulir"
  explanation: string;
  howToFix: {
    primaryStep: string;
    steps: string[];
    actionLabel?: string;
  };
  statusCode?: number;
  originalError?: unknown;
}

export function classifyError(error: unknown, fallbackContext?: string): ClassifiedError {
  const errMessage =
    typeof error === "string"
      ? error
      : error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : "Terjadi gangguan sistem yang tidak terduga";

  const lower = errMessage.toLowerCase();

  // 1. Explicit Server / Database fault
  if (
    lower.includes("500") ||
    lower.includes("database") ||
    lower.includes("postgres") ||
    lower.includes("sql") ||
    lower.includes("internal server") ||
    lower.includes("supabase server")
  ) {
    return {
      whatWentWrong: fallbackContext || "Gangguan Basis Data & Server Komunitas",
      fault: "server",
      faultParty: "Kesalahan Server / Database Komunitas (Bukan Perangkat Anda)",
      explanation:
        "Layanan database atau server komputasi kami mengalami kegagalan internal saat menjalankan instruksi query.",
      howToFix: {
        primaryStep: "Tunggu beberapa saat lalu coba lagi, atau laporkan kendala ke admin portal.",
        steps: [
          "Data formulir Anda tetap aman dan tidak hilang.",
          "Tim pengembang komunitas menerima sinyal otomatis perbaikan bug ini.",
          "Muat ulang halaman dalam 1-2 menit.",
        ],
        actionLabel: "Muat Ulang Halaman",
      },
      statusCode: 500,
      originalError: error,
    };
  }

  // 2. Network / Connectivity fault
  if (
    lower.includes("network") ||
    lower.includes("failed to fetch") ||
    lower.includes("offline") ||
    lower.includes("timeout") ||
    lower.includes("aborterror") ||
    lower.includes("econnrefused")
  ) {
    return {
      whatWentWrong: "Gagal Menghubungi Server Komunitas",
      fault: "network",
      faultParty: "Koneksi Jaringan Perangkat Anda",
      explanation:
        "Permintaan data terputus di tengah jalan karena sinyal internet tidak stabil atau perangkat beralih mode jaringan.",
      howToFix: {
        primaryStep: "Periksa sambungan Wi-Fi atau data seluler Anda, lalu tekan tombol 'Coba Lagi'.",
        steps: [
          "Pastikan sinyal internet di gawai atau laptop Anda dalam status aktif.",
          "Jika sedang di jalur touring dengan sinyal minim, aktifkan Mode Hemat Data.",
          "Muat ulang halaman saat sinyal kembali stabil.",
        ],
        actionLabel: "Coba Lagi",
      },
      statusCode: 0,
      originalError: error,
    };
  }

  // 2. Authentication / Session fault
  if (
    lower.includes("jwt") ||
    lower.includes("session") ||
    lower.includes("unauthorized") ||
    lower.includes("401") ||
    lower.includes("token expired")
  ) {
    return {
      whatWentWrong: "Sesi Autentikasi Telah Berakhir",
      fault: "auth",
      faultParty: "Kedaluwarsa Kunci Sesi Pengguna",
      explanation:
        "Masa berlaku token login Anda telah habis demi keamanan privasi dan akun anggota komunitas Anda.",
      howToFix: {
        primaryStep: "Masuk kembali ke portal untuk memperbarui kredensial Anda.",
        steps: [
          "Draf data ketikan Anda telah diamankan otomatis di memori peramban.",
          "Masuk kembali menggunakan nomor registrasi atau email komunitas.",
          "Anda akan otomatis dikembalikan ke formulir yang sedang Anda isi.",
        ],
        actionLabel: "Masuk Kembali",
      },
      statusCode: 401,
      originalError: error,
    };
  }

  // 3. Permission / Access fault
  if (
    lower.includes("forbidden") ||
    lower.includes("403") ||
    lower.includes("permission") ||
    lower.includes("hak akses") ||
    lower.includes("access denied")
  ) {
    return {
      whatWentWrong: "Akses Ditolak: Otoritas Tidak Cukup",
      fault: "auth",
      faultParty: "Batasan Hak Akses Akun",
      explanation:
        "Tindakan atau halaman ini diproteksi dan hanya dapat diakses oleh peran pengurus tertentu.",
      howToFix: {
        primaryStep: "Hubungi Dewan Pengurus atau Sekretariat bila Anda membutuhkan akses administratif ini.",
        steps: [
          "Pastikan Anda login dengan akun pengurus resmi (bukan akun anggota biasa).",
          "Minta pembaruan wewenang peran (Role assignment) ke Super Admin.",
          "Kembali ke Beranda atau Dashboard umum.",
        ],
        actionLabel: "Kembali ke Dashboard",
      },
      statusCode: 403,
      originalError: error,
    };
  }

  // 4. User Input / Validation fault
  if (
    lower.includes("validation") ||
    lower.includes("duplikat") ||
    lower.includes("already registered") ||
    lower.includes("format salah") ||
    lower.includes("400") ||
    lower.includes("bad request")
  ) {
    return {
      whatWentWrong: "Data Yang Dikirim Tidak Memenuhi Persyaratan",
      fault: "user",
      faultParty: "Ketidaksesuaian Isian Formulir",
      explanation:
        "Sistem menolak masukan karena ada kolom yang tidak lengkap, format KTP/nomor plat keliru, atau data telah terdaftar sebelumnya.",
      howToFix: {
        primaryStep: "Tinjau kembali kolom formulir yang ditandai warna merah dan sesuaikan isian Anda.",
        steps: [
          "Pastikan nomor telepon dimulai dari format 08 atau 628.",
          "Periksa panjang digit NIK KTP (wajib 16 digit angka).",
          "Pastikan email belum pernah digunakan untuk registrasi anggota lain.",
        ],
        actionLabel: "Periksa Formulir",
      },
      statusCode: 400,
      originalError: error,
    };
  }

  // 5. Server / Database / Cloud fault
  return {
    whatWentWrong: fallbackContext || "Terjadi Gangguan Internal pada Sistem",
    fault: "server",
    faultParty: "Kesalahan Server / Database Komunitas (Bukan Perangkat Anda)",
    explanation:
      "Server database Supabase atau sistem penyimpanan kami mengalami kendala sementara saat memproses permintaan ini.",
    howToFix: {
      primaryStep: "Tunggu beberapa saat lalu coba lagi, atau laporkan kendala ke admin portal.",
      steps: [
        "Data formulir Anda tetap aman dan tidak hilang.",
        "Tim IT komunitas menerima pemberitahuan otomatis mengenai anomali ini.",
        "Coba lakukan tindakan ulang dalam 1-2 menit.",
      ],
      actionLabel: "Muat Ulang Halaman",
    },
    statusCode: 500,
    originalError: error,
  };
}
