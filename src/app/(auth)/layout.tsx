import Link from "next/link";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { Brand } from "@/components/brand";
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-dvh lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
    <a href="#auth-form" className="sr-only z-50 rounded-md bg-card p-3 focus:not-sr-only focus:absolute focus:left-4 focus:top-4">Skip to form</a>
    <aside className="hidden flex-col justify-between border-r bg-sidebar p-12 lg:flex xl:p-16">
      <Link href="/login" aria-label="Winter Arc OS sign in"><Brand /></Link>
      <div className="my-20 max-w-md">
        <div className="mb-8 flex items-center gap-3 text-sm text-muted-foreground"><span className="h-px w-8 bg-primary" />One day at a time</div>
        <h2 className="max-w-md text-[2.75rem] font-medium leading-[1.15] tracking-[-0.035em]">Build a rhythm<br />you can return to.</h2>
        <p className="mt-6 max-w-sm text-base leading-7 text-muted-foreground">Your work. Your well-being. Your own pace.<br />A private space for the days ahead.</p>
        <div className="mt-12 flex items-center gap-3 border-t pt-6 text-sm text-muted-foreground"><ArrowUpRight className="size-4 text-primary" aria-hidden="true" />Make today a little more intentional.</div>
      </div>
      <span className="flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" aria-hidden="true" />Your workspace stays yours.</span>
    </aside>
    <main id="auth-content" className="auth-main flex min-h-dvh min-w-0 flex-col px-6 py-8 sm:px-12">
      <Link href="/login" aria-label="Winter Arc OS sign in" className="self-start lg:hidden"><Brand /></Link>
      <div className="flex flex-1 items-center justify-center py-14">{children}</div>
      <p className="text-center text-xs text-muted-foreground">Winter Arc OS · Personal workspace</p>
    </main>
  </div>;
}
