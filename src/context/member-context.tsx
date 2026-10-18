"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";

export interface CurrentMember {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  displayName: string;
  phoneNumber: string;
  city: string;
  bloodType: string;
  bio: string;
  avatarUrl?: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  memberNumber: string;
  status: string;
  motorcycleModel: string;
  motorcyclePlate: string;
  motorcycleYear: number | string;
  joinedDate: string;
  qrVerificationToken: string;
}

interface MemberContextType {
  member: CurrentMember | null;
  loading: boolean;
  refreshMember: () => Promise<void>;
  updateMemberLocal: (data: Partial<CurrentMember>) => void;
}

const MemberContext = React.createContext<MemberContextType>({
  member: null,
  loading: true,
  refreshMember: async () => {},
  updateMemberLocal: () => {},
});

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = React.useState<CurrentMember | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const fetchProfile = React.useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const res = await fetch("/api/member/profile", {
        headers,
        cache: "no-store",
      });

      const json = await res.json();
      if (json.success && json.data) {
        setMember(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat profil anggota:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateMemberLocal = (data: Partial<CurrentMember>) => {
    setMember((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <MemberContext.Provider
      value={{
        member,
        loading,
        refreshMember: fetchProfile,
        updateMemberLocal,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
}

export function useMember() {
  return React.useContext(MemberContext);
}
