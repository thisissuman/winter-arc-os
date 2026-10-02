import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "no-referrer" };
export async function GET() {
  if (!isSupabaseConfigured()) return Response.json({ message: "Account service is unavailable." }, { status: 503, headers });
  try {
    const supabase = await createClient();
    const { data: identity, error: authError } = await supabase.auth.getUser();
    if (authError || !identity.user) return Response.json({ message: "Sign in to export your data." }, { status: 401, headers });
    const { data, error } = await supabase.rpc("export_workspace_data");
    if (error || !data) return Response.json({ message: "Export could not be prepared. Retry when connected." }, { status: 503, headers });
    return Response.json(data, { headers: {
      ...headers,
      "Content-Disposition": 'attachment; filename="winter-arc-os-' + new Date().toISOString().slice(0, 10) + '.json"',
    } });
  } catch {
    return Response.json({ message: "Export could not be prepared. Check your connection and retry." }, { status: 503, headers });
  }
}
