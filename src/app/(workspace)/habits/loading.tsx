import { Skeleton } from "@/components/ui/skeleton";

export default function HabitsLoading() {
  return <div aria-busy="true" aria-label="Loading habit history" className="space-y-7">
    <Skeleton className="h-9 w-40" />
    <Skeleton className="h-11 max-w-sm" />
    <Skeleton className="h-72 w-full" />
  </div>;
}
