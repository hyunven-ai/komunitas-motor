import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock-project.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const pathname = request.nextUrl.pathname;

  // Protected paths
  const isMemberPath = pathname.startsWith("/member");
  const isAdminPath = pathname.startsWith("/admin") && pathname !== "/admin/login";

  // Skip auth checking if in local dev with mock keys, to allow development viewing
  const isMockEnv = supabaseUrl.includes("mock-project") || !process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (isMemberPath || isAdminPath) {
    if (isMockEnv) {
      // In mock development mode, allow navigation to inspect UI layouts
      return response;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginRoute = pathname.startsWith("/admin") ? "/admin/login" : "/login";
      const url = new URL(loginRoute, request.url);
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }

    if (isAdminPath) {
      // Query user role server-side
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const roleList = roles?.map((r) => r.role) || [];
      const hasAdminAccess = roleList.some((r) =>
        ["super_admin", "chairman", "admin", "treasurer", "event_officer", "moderator"].includes(r)
      );

      if (!hasAdminAccess) {
        return NextResponse.redirect(new URL("/member", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
