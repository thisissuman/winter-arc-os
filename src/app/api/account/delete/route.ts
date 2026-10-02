import { cookies } from "next/headers";
import { applicationOrigin } from "@/lib/auth/origin";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAccountDeletionConfigured } from "@/lib/supabase/admin";
import { accountDeletionSchema } from "@/features/settings/data-validation";
import { verifyCurrentPassword } from "@/features/settings/verify-password";

const headers = { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "no-referrer" };
const reply = (message: string, status: number) => Response.json({ message }, { status, headers });
export async function POST(request: Request) {
  try {
    if (request.headers.get("origin") !== applicationOrigin()) return reply("This request must come from your workspace.", 403);
    if (!request.headers.get("content-type")?.startsWith("application/json")) return reply("Submit the account deletion form.", 415);
    if (Number(request.headers.get("content-length") ?? 0) > 4096) return reply("Request is too large.", 413);
    const body = await request.text();
    if (body.length > 4096) return reply("Request is too large.", 413);
    let input: unknown;
    try { input = JSON.parse(body); } catch { return reply("Review the deletion form.", 400); }
    const parsed = accountDeletionSchema.safeParse(input);
    if (!parsed.success) return reply("Enter your current password and type DELETE MY ACCOUNT.", 400);
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user?.email) return reply("Sign in before deleting your account.", 401);
    if (!isAccountDeletionConfigured()) return reply("Account deletion is unavailable. Contact the workspace operator.", 503);
    if (!await verifyCurrentPassword(data.user.id, data.user.email, parsed.data.password))
      return reply("Password verification failed. Check your current password and retry.", 403);
    const { error: deletionError } = await createAdminClient().auth.admin.deleteUser(data.user.id, false);
    if (deletionError) return reply("Deletion could not be confirmed. Try signing in again before retrying.", 503);
    // Delete local session cookies even if Auth rejects sign-out after deleting the identity.
    const store = await cookies();
    for (const cookie of store.getAll()) if (cookie.name.startsWith("sb-") || cookie.name === "winter-arc-theme") store.delete(cookie.name);
    return reply("Account and workspace data deleted.", 200);
  } catch { return reply("Deletion could not be confirmed. Check your connection, then try signing in again.", 503); }
}
