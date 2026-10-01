import { Skeleton } from "@/components/ui/skeleton";

export default function InsightsLoading() {
  return <div className="space-y-5" aria-label="Loading Insights"><Skeleton className="h-10 w-48" /><Skeleton className="h-32 w-full" /><div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div><Skeleton className="h-72 w-full" /></div>;
}
