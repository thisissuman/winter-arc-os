import Link from "next/link";
import { Database } from "lucide-react";

export function TrackingUnavailable({ message }: { message?: string }) {
  return <section className="mt-8 max-w-2xl rounded-xl border bg-card p-7" aria-labelledby="tracking-setup-title">
    <Database className="mb-5 size-6 text-muted-foreground" aria-hidden="true" />
    <h2 id="tracking-setup-title" className="text-xl font-medium">Tracking setup is required</h2>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">{message ?? "One or more versioned tracking migrations have not been applied to this project. Apply the repository migrations before using these features."}</p>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">Your account is connected. No tracker history has been created.</p>
    <Link href="/settings" className="mt-5 inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4">Return to account settings</Link>
  </section>;
}
