import Link from "next/link";
import { Brand } from "@/components/brand";
import { Navigation } from "@/components/shell/navigation";
import { MobileViewport } from "@/components/shell/mobile-viewport";
import { LogoutButton } from "@/components/shell/logout-button";
import { requireAccount } from "@/lib/auth/session";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAccount();
  const name = profile.display_name || "Your account";
  return (
    <div className="workspace-shell min-h-dvh">
      <MobileViewport />
      <a
        href="#workspace-content"
        className="sr-only z-50 rounded-md bg-card p-3 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <aside className="workspace-sidebar fixed inset-y-0 left-0 hidden w-60 min-h-0 flex-col border-r bg-sidebar px-4 py-6 md:flex">
        <Link href="/today" className="ml-3" aria-label="Winter Arc OS Today">
          <Brand />
        </Link>
        <div className="workspace-sidebar-nav mt-8 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
          <Navigation />
        </div>
        <div className="workspace-sidebar-footer mt-4 shrink-0 border-t pt-4">
          <div className="mb-3 flex min-w-0 items-center gap-3 px-3">
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium"
            >
              {name.slice(0, 1).toUpperCase()}
            </span>
            <span className="truncate text-sm">{name}</span>
          </div>
          <LogoutButton />
        </div>
      </aside>
      <header className="workspace-mobile-header border-b bg-sidebar px-6 py-5 md:hidden">
        <Link href="/today" aria-label="Winter Arc OS Today">
          <Brand />
        </Link>
      </header>
      <div className="md:pl-60">
        <main
          id="workspace-content"
          tabIndex={-1}
          className="workspace-main mx-auto min-w-0 max-w-[920px] px-6 pt-8 sm:px-10 md:py-12 lg:px-12"
        >
          {children}
        </main>
      </div>
      <div className="workspace-mobile-dock fixed inset-x-0 bottom-0 z-20 flex flex-col md:contents">
        <div className="border-t bg-sidebar md:hidden">
          <Navigation mobile />
        </div>
      </div>
    </div>
  );
}
