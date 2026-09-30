import Link from "next/link";
import { ArrowRight, Check, CircleDashed, Sunrise } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireAccount } from "@/lib/auth/session";

export const metadata = { title: "Today" };
export default async function TodayPage() {
  const { profile, preferences } = await requireAccount();
  const date = new Intl.DateTimeFormat("en", { timeZone: preferences.timezone, weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const name = profile.display_name.trim().split(/\s+/)[0];
  return <>
    <header className="flex flex-wrap items-end justify-between gap-4 border-b pb-7">
      <div><p className="mb-2 text-sm text-muted-foreground">{date}</p><h1 className="text-3xl font-semibold tracking-[-0.03em]">Today</h1></div>
      <span className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-muted-foreground"><span className="size-1.5 rounded-full bg-primary" />Personal workspace</span>
    </header>
    <p className="mt-7 text-sm text-muted-foreground">{name ? `Welcome, ${name}.` : "Welcome."} A clear space for the day ahead.</p>
    <section aria-labelledby="empty-title" className="mt-7 grid overflow-hidden rounded-xl border bg-card lg:grid-cols-[1.55fr_1fr]">
      <div className="px-7 py-10 sm:p-10">
        <Sunrise className="mb-8 size-8 text-primary" aria-hidden="true" strokeWidth={1.4} />
        <h2 id="empty-title" className="text-2xl font-medium tracking-[-0.025em]">A fresh workspace.<br />A little room to grow.</h2>
        <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Your account is ready. Habits and targets will appear here when tracking is available. For now, make this space yours.</p>
        <Button asChild className="mt-7 h-11 px-4"><Link href="/settings">Review your profile<ArrowRight className="ml-3 size-4" aria-hidden="true" /></Link></Button>
      </div>
      <div className="border-t px-7 py-8 lg:border-t-0 lg:border-l lg:p-10">
        <h3 className="text-sm font-medium">Your daily overview</h3>
        <div className="mt-7 space-y-6">
          <div><span className="flex items-center gap-2 text-sm"><CircleDashed className="size-4 text-muted-foreground" aria-hidden="true" />No scheduled targets</span><p className="mt-2 text-xs leading-5 text-muted-foreground">A daily score appears when there are targets to measure.</p></div>
          <div className="border-t pt-5"><p className="text-sm">Weekly progress</p><p className="mt-2 text-xs leading-5 text-muted-foreground">No active weekly targets.</p></div>
          <div className="border-t pt-5"><p className="text-sm">Current challenge</p><p className="mt-2 text-xs leading-5 text-muted-foreground">No challenge selected.</p></div>
        </div>
      </div>
    </section>
    <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-2"><Check className="size-3.5 text-success" aria-hidden="true" />Account connected</span><span>{preferences.timezone} · {preferences.week_starts_on === 1 ? "Monday" : "Configured"} week start</span></footer>
  </>;
}
