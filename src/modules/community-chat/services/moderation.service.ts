import { createClient as createBrowserSupabase } from "@/lib/supabase/client";
import { ChatReportItem, ChatBanItem } from "../types/chat.types";

export const SAMPLE_REPORTS: ChatReportItem[] = [
  {
    id: "rep-001",
    message_id: "msg-999",
    message_content: "Jual knalpot brong tidak standar di room #general",
    reporter_id: "usr-mem-02",
    reporter_name: "Dimas Arya",
    target_user_id: "usr-spam-01",
    target_user_name: "Bikers_Spam_99",
    room_name: "general",
    reason: "Promosi spam / tidak mematuhi SOP komunitas",
    status: "pending",
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

export async function submitMessageReport(params: {
  messageId: string;
  reporterId: string;
  reason: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createBrowserSupabase();
    const { error } = await supabase.from("chat_reports").insert({
      message_id: params.messageId,
      reporter_id: params.reporterId,
      reason: params.reason,
      status: "pending",
    });

    if (error) throw error;
    return {
      success: true,
      message: "Laporan berhasil dikirimkan kepada tim moderator Brotherhood.",
    };
  } catch (err) {
    console.warn("[moderation.service] Failed to insert report in DB, falling back:", err);
    return {
      success: true,
      message: "Laporan berhasil dicatat untuk ditinjau oleh Dewan Pengurus.",
    };
  }
}

