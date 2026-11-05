"use client";

import * as React from "react";
import { OfflineBanner } from "./offline-state";
import { SessionExpiredModal } from "./session-expired-state";
import { DraftStorage } from "@/lib/states/draft-storage";

interface SessionExpiredEventDetail {
  formId?: string;
  formData?: unknown;
  formTitle?: string;
  loginUrl?: string;
}

export function GlobalStateProvider({ children }: { children: React.ReactNode }) {
  const [sessionModal, setSessionModal] = React.useState<{
    isOpen: boolean;
    formId: string;
    formData?: unknown;
    formTitle?: string;
    loginUrl?: string;
  }>({
    isOpen: false,
    formId: "portal_autosave",
  });

  // Clean expired drafts periodically on load
  React.useEffect(() => {
    DraftStorage.cleanExpired();

    const handleSessionExpiredEvent = (e: Event) => {
      const customEvent = e as CustomEvent<SessionExpiredEventDetail>;
      const detail = customEvent.detail || {};
      setSessionModal({
        isOpen: true,
        formId: detail.formId || "portal_autosave",
        formData: detail.formData,
        formTitle: detail.formTitle || "Sesi Formulir Aktif",
        loginUrl: detail.loginUrl || "/login",
      });
    };

    window.addEventListener("brotherhood-session-expired", handleSessionExpiredEvent);

    return () => {
      window.removeEventListener("brotherhood-session-expired", handleSessionExpiredEvent);
    };
  }, []);

  return (
    <>
      {children}
      {/* State 4: Keep cached content on screen, say what still works */}
      <OfflineBanner />

      {/* State 8: Session expired modal with auto draft protection */}
      <SessionExpiredModal
        isOpen={sessionModal.isOpen}
        formId={sessionModal.formId}
        currentFormData={sessionModal.formData}
        formTitle={sessionModal.formTitle}
        loginUrl={sessionModal.loginUrl}
        onStay={() => setSessionModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}

