import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (typeof window !== "undefined" && client) {
    return client;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock-project.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key";

  const newClient = createBrowserClient(supabaseUrl, supabaseAnonKey);

  if (typeof window !== "undefined") {
    client = newClient;
  }

  return newClient;
}
