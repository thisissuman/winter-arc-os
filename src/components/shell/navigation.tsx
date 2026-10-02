"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Settings2, Grid2X2, CheckSquare2, Gauge, Flag, Dumbbell, BookOpenText, ListTodo, Target, ChartNoAxesCombined, NotebookPen, Ellipsis, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavigationItem = { href: string; label: string; icon: LucideIcon };
const desktopGroups: { label: string; items: NavigationItem[] }[] = [
  { label: "Daily Work", items: [{ href: "/today", label: "Today", icon: CalendarDays }, { href: "/habits", label: "Habits", icon: CheckSquare2 }, { href: "/metrics", label: "Metrics", icon: Gauge }, { href: "/fitness", label: "Fitness", icon: Dumbbell }, { href: "/career", label: "Career", icon: BookOpenText }, { href: "/tasks", label: "Tasks", icon: ListTodo }, { href: "/goals", label: "Goals", icon: Target }] },
  { label: "Review", items: [{ href: "/insights", label: "Insights", icon: ChartNoAxesCombined }, { href: "/reflection", label: "Reflection", icon: NotebookPen }, { href: "/challenges", label: "Challenges", icon: Flag }] },
  { label: "Manage", items: [{ href: "/settings", label: "Settings", icon: Settings2 }] },
];
const mobileNavigation: NavigationItem[] = [{ href: "/today", label: "Today", icon: CalendarDays }, { href: "/track", label: "Track", icon: Grid2X2 }, { href: "/plan", label: "Plan", icon: ListTodo }, { href: "/insights", label: "Insights", icon: ChartNoAxesCombined }, { href: "/more", label: "More", icon: Ellipsis }];

export function Navigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  function link({ href, label, icon: Icon }: NavigationItem) {
    const active = pathname === href || pathname.startsWith(`${href}/`) || mobile && href === "/track" && ["/habits", "/metrics", "/fitness", "/career"].some((item) => pathname.startsWith(item)) || mobile && href === "/plan" && ["/tasks", "/goals"].some((item) => pathname.startsWith(item)) || mobile && href === "/more" && ["/settings", "/challenges", "/reflection"].some((item) => pathname.startsWith(item));
    return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center rounded-lg text-sm font-medium transition-colors", mobile ? "flex-col justify-center gap-1 py-1 text-xs" : "gap-3 px-3", active ? "bg-selected text-selected-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
      <Icon className={mobile ? "size-5" : "size-4"} aria-hidden="true" strokeWidth={1.7} />{label}
    </Link>;
  }
  return <nav aria-label={mobile ? "Mobile navigation" : "Main navigation"} className={mobile ? "grid h-[var(--mobile-nav-height)] grid-cols-5 gap-1 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]" : "space-y-6"}>
    {mobile ? mobileNavigation.map(link) : desktopGroups.map((group) => <div key={group.label} role="group" aria-label={group.label}>
      <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">{group.label}</p>
      <div className="space-y-1">{group.items.map(link)}</div>
    </div>)}
  </nav>;
}
