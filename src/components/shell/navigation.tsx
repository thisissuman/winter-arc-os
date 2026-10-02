"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Settings2, Grid2X2, CheckSquare2, Gauge, Flag, Dumbbell, BookOpenText, ListTodo, Target, ChartNoAxesCombined, NotebookPen, Ellipsis } from "lucide-react";
import { cn } from "@/lib/utils";

const desktopNavigation = [{ href: "/today", label: "Today", icon: CalendarDays }, { href: "/habits", label: "Habits", icon: CheckSquare2 }, { href: "/metrics", label: "Metrics", icon: Gauge }, { href: "/fitness", label: "Fitness", icon: Dumbbell }, { href: "/career", label: "Career", icon: BookOpenText }, { href: "/tasks", label: "Tasks", icon: ListTodo }, { href: "/goals", label: "Goals", icon: Target }, { href: "/insights", label: "Insights", icon: ChartNoAxesCombined }, { href: "/reflection", label: "Reflection", icon: NotebookPen }, { href: "/challenges", label: "Challenges", icon: Flag }, { href: "/settings", label: "Settings", icon: Settings2 }];
const mobileNavigation = [{ href: "/today", label: "Today", icon: CalendarDays }, { href: "/track", label: "Track", icon: Grid2X2 }, { href: "/plan", label: "Plan", icon: ListTodo }, { href: "/insights", label: "Insights", icon: ChartNoAxesCombined }, { href: "/more", label: "More", icon: Ellipsis }];
export function Navigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const navigation = mobile ? mobileNavigation : desktopNavigation;
  return <nav aria-label={mobile ? "Mobile navigation" : "Main navigation"} className={mobile ? "grid grid-cols-5 gap-1 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]" : "space-y-1"}>
    {navigation.map(({ href, label, icon: Icon }) => { const active = pathname === href || pathname.startsWith(`${href}/`) || mobile && href === "/track" && ["/habits", "/metrics", "/fitness", "/career"].some((item) => pathname.startsWith(item)) || mobile && href === "/plan" && ["/tasks", "/goals"].some((item) => pathname.startsWith(item)) || mobile && href === "/more" && ["/settings", "/challenges", "/reflection"].some((item) => pathname.startsWith(item)); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center rounded-lg text-sm font-medium transition-colors", mobile ? "flex-col justify-center gap-1 py-2 text-xs" : "gap-3 px-3", active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
      <Icon className={mobile ? "size-5" : "size-4"} aria-hidden="true" strokeWidth={1.7} />{label}
    </Link>; })}
  </nav>;
}
