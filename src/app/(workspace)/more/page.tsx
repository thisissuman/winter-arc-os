import Link from "next/link";
import { ArrowUpRight, Flag, NotebookPen, Settings2 } from "lucide-react";
import { PageHeader } from "@/components/tracking/page-header";

export const metadata = { title: "More" };
const links = [
  { href: "/reflection", title: "Reflection", description: "Write weekly reviews and monthly reflections beside your statistics.", icon: NotebookPen },
  { href: "/challenges", title: "Challenges", description: "Manage your active and past challenge periods.", icon: Flag },
  { href: "/settings", title: "Settings", description: "Update your account, appearance, and tracking preferences.", icon: Settings2 },
];
export default function MorePage() {
  return <><PageHeader title="More" description="Your reviews, challenges, and settings." /><div className="mt-7 grid gap-4 md:grid-cols-2">{links.map(({ href, title, description, icon: Icon }) => <Link key={href} href={href} aria-label={title} className="group flex min-h-40 flex-col justify-between rounded-xl border bg-card p-6 transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><div className="flex justify-between"><Icon className="size-6 text-primary" aria-hidden="true" /><ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary" aria-hidden="true" /></div><div><h2 className="text-lg font-medium">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{description}</p></div></Link>)}</div></>;
}
