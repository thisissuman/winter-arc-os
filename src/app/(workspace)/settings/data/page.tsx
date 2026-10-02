import Link from "next/link";
import { PageHeader } from "@/components/tracking/page-header";
import { requireAccount } from "@/lib/auth/session";
import { isAccountDeletionConfigured } from "@/lib/supabase/admin";
import { DeleteAccountForm, DeleteDataForm, ExportControl } from "@/features/settings/data-forms";

export const metadata = { title: "Data controls" };
export default async function DataSettingsPage() {
  await requireAccount();
  return <><PageHeader title="Data controls" description="Keep a copy of your data or permanently remove it." actions={<Link href="/settings" className="inline-flex min-h-11 items-center text-sm text-primary underline">All settings</Link>} />
    <section aria-labelledby="export-title" className="grid gap-6 border-b py-8 lg:grid-cols-[1fr_1.6fr]"><div><h2 id="export-title" className="text-lg font-medium">Export your data</h2></div><ExportControl /></section>
    <section aria-labelledby="delete-data-title" className="grid gap-6 border-b py-8 lg:grid-cols-[1fr_1.6fr]"><div><h2 id="delete-data-title" className="text-lg font-medium">Delete workspace data</h2><p className="mt-2 text-sm text-muted-foreground">Keep your account and start fresh.</p></div><DeleteDataForm /></section>
    <section aria-labelledby="delete-account-title" className="grid gap-6 py-8 lg:grid-cols-[1fr_1.6fr]"><div><h2 id="delete-account-title" className="text-lg font-medium">Delete account</h2><p className="mt-2 text-sm text-muted-foreground">Remove your account and all its data.</p></div><DeleteAccountForm available={isAccountDeletionConfigured()} /></section>
  </>;
}
