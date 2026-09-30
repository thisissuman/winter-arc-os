import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { applicationOrigin } from "@/lib/auth/origin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { safeRedirect } from "@/lib/auth/redirect";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const code = params.get("code");
  const type = params.get("type");
  const origin = applicationOrigin();
  let destination = "/login?notice=invalid-link";
  if (isSupabaseConfigured() && (code || (tokenHash && (type === "signup" || type === "recovery")))) {
    try {
      const supabase = await createClient();
      if (code) {
        // Default hosted email templates return a code bound to this browser's PKCE verifier.
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) destination = safeRedirect(params.get("next"));
      } else if (tokenHash && (type === "signup" || type === "recovery")) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (!error) destination = type === "recovery" ? "/reset-password" : safeRedirect(params.get("next"));
      }
    } catch { destination = "/login?notice=verification-unavailable"; }
  }
  const response = NextResponse.redirect(new URL(destination, origin));
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
