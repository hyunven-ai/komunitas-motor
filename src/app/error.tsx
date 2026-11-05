"use client";

import * as React from "react";
import { ErrorState } from "@/components/states";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log unexpected errors
    console.error("[BrotherhoodPortal RootError]", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-8 bg-asphalt-grit">
      <div className="w-full max-w-3xl">
        <ErrorState
          error={error}
          contextTitle="Gangguan Sistem Portal Terdeteksi"
          onRetry={reset}
          retryLabel="Coba Muat Ulang"
          secondaryAction={{
            label: "Kembali ke Beranda Komunitas",
            href: "/",
          }}
        />
      </div>
    </div>
  );
}

