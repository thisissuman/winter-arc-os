import Link from "next/link";
import { Brand } from "@/components/brand";
import { Navigation } from "@/components/shell/navigation";
import { LogoutButton } from "@/components/shell/logout-button";
import { requireAccount } from "@/lib/auth/session";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAccount();
  const name = profile.display_name || "Your account";
  return <div className="min-h-dvh">
    <a href="#workspace-content" className="sr-only z-50 rounded-md bg-card p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r bg-sidebar px-4 py-8 md:flex">
      <Link href="/today" className="ml-3" aria-label="Winter Arc OS Today"><Brand /></Link>
      <p className="mt-12 mb-3 px-3 text-xs text-muted-foreground">Workspace</p>
      <Navigation />
      <div className="mt-auto border-t pt-5">
        <div className="mb-3 flex min-w-0 items-center gap-3 px-3"><span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium">{name.slice(0, 1).toUpperCase()}</span><span className="truncate text-sm">{name}</span></div>
        <LogoutButton />
      </div>
    </aside>
    <header className="border-b bg-sidebar px-6 py-5 md:hidden"><Link href="/today" aria-label="Winter Arc OS Today"><Brand /></Link></header>
    <div className="md:pl-60"><main id="workspace-content" tabIndex={-1} className="mx-auto max-w-[1200px] px-6 pt-8 pb-28 sm:px-10 md:py-12 lg:px-14">{children}</main></div>
    <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-sidebar md:hidden"><Navigation mobile /></div>
  </div>;
}
