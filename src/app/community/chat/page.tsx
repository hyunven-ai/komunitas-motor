import { Metadata } from "next";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ChatLayout, ChatSenderProfile } from "@/modules/community-chat";
import { constructMetadata } from "@/lib/seo/config";
import { AppRole } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = constructMetadata({
  title: "Community Chat Discord-Style — Borneo Brotherhood Portal",
  titleEn: "Community Chat | Borneo Brotherhood Bikers",
  description:
    "Ruang obrolan langsung dan koordinasi ekspedisi touring komunitas motor Borneo Brotherhood.",
  path: "/community/chat",
});

interface PageProps {
  searchParams?: Promise<{ channel?: string }>;
}

export default async function CommunityChatPage({ searchParams }: PageProps) {
  const sParams = searchParams ? await searchParams : {};
  const initialChannel = sParams.channel || "general";

  let currentUser: ChatSenderProfile | null = null;

  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      let profile: any = null;
      let role: AppRole = "member";
      let memberNumber = "BMC-MEMBER";

      try {
        const adminSupabase = createAdminClient();
        const [profileRes, roleRes, memberRes] = await Promise.all([
          adminSupabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          adminSupabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
          adminSupabase.from("members").select("member_number").eq("user_id", user.id).maybeSingle(),
        ]);

        profile = profileRes.data;
        role = (roleRes.data?.role as AppRole) || "member";
        memberNumber = memberRes.data?.member_number || "BMC-MEMBER";
      } catch {
        const [profileRes, roleRes, memberRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
          supabase.from("members").select("member_number").eq("user_id", user.id).maybeSingle(),
        ]);

        profile = profileRes.data;
        role = (roleRes.data?.role as AppRole) || "member";
        memberNumber = memberRes.data?.member_number || "BMC-MEMBER";
      }

      currentUser = {
        id: user.id,
        full_name: profile?.full_name || user.user_metadata?.full_name || "Anggota Brotherhood",
        display_name: profile?.display_name || profile?.full_name || "Bikers",
        username: profile?.username || undefined,
        avatar_url: profile?.avatar_url || null,
        member_number: memberNumber,
        role,
        is_verified: true,
      };
    }
  } catch (err) {
    console.warn("[CommunityChatPage] Session resolution fallback:", err);
  }

  // Fallback demo user if in local mock development mode
  if (!currentUser && process.env.NODE_ENV === "development") {
    currentUser = {
      id: "usr-demo-01",
      full_name: "Dimas Arya",
      display_name: "Dimas (Demo)",
      username: "dimas_ride",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      member_number: "BMC-2026-0042",
      role: "member",
      is_verified: true,
    };
  }

  return <ChatLayout initialSlug={initialChannel} currentUser={currentUser} />;
}

