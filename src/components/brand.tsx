import { Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
export function Brand({ className }: { className?: string }) {
  return <span className={cn("inline-flex items-center gap-3", className)}>
    <Snowflake className="size-6 text-primary" aria-hidden="true" strokeWidth={1.6} />
    <span className="text-sm font-semibold tracking-[-0.02em]">Winter Arc<span className="ml-1.5 font-normal text-muted-foreground">OS</span></span>
  </span>;
}
