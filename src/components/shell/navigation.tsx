"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CheckSquare2, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
const navigation = [
  { href: "/today", label: "Today", icon: CalendarDays },
  { href: "/habits", label: "Habits", icon: CheckSquare2 },
  { href: "/settings", label: "Settings", icon: Settings2 },
];
export function Navigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label={mobile ? "Mobile navigation" : "Main navigation"}
      className={
        mobile
          ? "grid h-[var(--mobile-nav-height)] grid-cols-3 gap-1 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
          : "space-y-2"
      }
    >
      {navigation.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
          className={cn(
            "flex min-h-11 items-center rounded-lg font-medium transition-colors",
            mobile
              ? "flex-col justify-center gap-1 py-1 text-xs"
              : "gap-3 px-3 text-sm",
            pathname === href
              ? "bg-selected text-selected-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          <Icon className="size-5" strokeWidth={1.7} aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
