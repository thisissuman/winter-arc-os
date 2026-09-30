"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [{ href: "/today", label: "Today", icon: CalendarDays }, { href: "/settings", label: "Settings", icon: Settings2 }];
export function Navigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return <nav aria-label={mobile ? "Mobile navigation" : "Main navigation"} className={mobile ? "grid grid-cols-2 gap-2 px-6 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]" : "space-y-1"}>
    {navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={cn("flex min-h-11 items-center rounded-lg text-sm font-medium transition-colors", mobile ? "flex-col justify-center gap-1 py-2 text-xs" : "gap-3 px-3", pathname === href ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
      <Icon className={mobile ? "size-5" : "size-4"} aria-hidden="true" strokeWidth={1.7} />{label}
    </Link>)}
  </nav>;
}
