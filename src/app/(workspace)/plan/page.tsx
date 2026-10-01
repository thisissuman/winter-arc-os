import Link from "next/link";
import { ArrowUpRight, CalendarCheck2, Target } from "lucide-react";
import { PageHeader } from "@/components/tracking/page-header";

export const metadata = { title: "Plan" };
const links = [
  { href: "/tasks", title: "Weekly tasks", description: "Plan seven days, update status, reorder, and carry unfinished work.", icon: CalendarCheck2 },
  { href: "/goals", title: "Goals", description: "Follow manual, milestone, or measured progress toward longer outcomes.", icon: Target },
];
export default function PlanPage() {
  return <><PageHeader title="Plan" description="Turn longer outcomes into work you can see and adjust." /><div className="mt-7 grid gap-4 md:grid-cols-2">{links.map(({ href, title, description, icon: Icon }) => <Link key={href} href={href} className="group flex min-h-44 flex-col justify-between rounded-xl border bg-card p-6 transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><div className="flex justify-between"><Icon className="size-6 text-primary" aria-hidden="true" /><ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary" aria-hidden="true" /></div><div><h2 className="text-lg font-medium">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{description}</p></div></Link>)}</div></>;
}
