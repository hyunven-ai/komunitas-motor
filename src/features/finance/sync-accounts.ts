import { SupabaseClient } from "@supabase/supabase-js";
import { getSystemSettings } from "@/features/settings/queries";

export interface EnrichedFinanceAccount {
  id: string;
  name: string;
  account_number?: string | null;
  accountHolder?: string;
  is_active: boolean;
  created_at?: string;
}

/**
 * Synchronizes finance_accounts table in Supabase with Portal Settings (Pengaturan Rekening)
 */
export async function syncFinanceAccountsWithSettings(
  supabase: SupabaseClient
): Promise<EnrichedFinanceAccount[]> {
  try {
    const settings = await getSystemSettings();

    // 1. Fetch current accounts
    let { data: accounts } = await supabase
      .from("finance_accounts")
      .select("*")
      .order("created_at", { ascending: true });

    if (!accounts || accounts.length === 0) {
      const defaultAccounts = [
        {
          name: "BCA (Rekening Utama)",
          account_number: settings.bcaAccountNumber || "3710335752",
          is_active: true,
        },
        {
          name: "Mandiri (Kas Operasional)",
          account_number: settings.mandiriAccountNumber || "133-00-29381-11",
          is_active: true,
        },
        {
          name: "Kas Tunai / Bendahara Cash",
          account_number: "CASH-HQ",
          is_active: true,
        },
      ];
      await supabase.from("finance_accounts").insert(defaultAccounts);
      const { data: refetched } = await supabase.from("finance_accounts").select("*");
      accounts = refetched || [];
    }

    // 2. Ensure BCA account matches settings
    const bcaAcc = accounts.find((a) => a.name.toLowerCase().includes("bca"));
    if (bcaAcc && settings.bcaAccountNumber && bcaAcc.account_number !== settings.bcaAccountNumber) {
      await supabase
        .from("finance_accounts")
        .update({ account_number: settings.bcaAccountNumber })
        .eq("id", bcaAcc.id);
      bcaAcc.account_number = settings.bcaAccountNumber;
    }

    // 3. Ensure Mandiri account matches settings
    const mandiriAcc = accounts.find((a) => a.name.toLowerCase().includes("mandiri"));
    if (
      mandiriAcc &&
      settings.mandiriAccountNumber &&
      mandiriAcc.account_number !== settings.mandiriAccountNumber
    ) {
      await supabase
        .from("finance_accounts")
        .update({ account_number: settings.mandiriAccountNumber })
        .eq("id", mandiriAcc.id);
      mandiriAcc.account_number = settings.mandiriAccountNumber;
    }

    // 4. Return enriched accounts with account holders
    return accounts.map((acc) => {
      let holder = "";
      if (acc.name.toLowerCase().includes("bca")) {
        holder = settings.bcaAccountHolder || "Steven Fo";
      } else if (acc.name.toLowerCase().includes("mandiri")) {
        holder = settings.mandiriAccountHolder || "Steven Fo";
      } else {
        holder = "Bendahara Umum";
      }

      return {
        ...acc,
        accountHolder: holder,
      };
    });
  } catch (err) {
    console.error("Error in syncFinanceAccountsWithSettings:", err);
    return [];
  }
}
