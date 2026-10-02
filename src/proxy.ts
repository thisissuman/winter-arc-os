import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseEnvironment } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  if (!isSupabaseConfigured()) return response;
  const { url, key } = supabaseEnvironment();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        response.headers.set("Cache-Control", "private, no-store, max-age=0");
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getClaims();
  return response;
}

export const config = { matcher: ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/auth/:path*", "/api/:path*", "/today/:path*", "/track/:path*", "/habits/:path*", "/metrics/:path*", "/challenges/:path*", "/onboarding/:path*", "/settings/:path*", "/fitness/:path*", "/career/:path*", "/tasks/:path*", "/goals/:path*", "/plan/:path*", "/insights/:path*", "/reflection/:path*", "/more/:path*"] };
