import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return <div role="status" aria-label="Loading your workspace" className="space-y-6"><Skeleton className="h-8 w-40" /><Skeleton className="h-4 w-64" /><Skeleton className="h-80 w-full rounded-xl" /><span className="sr-only">Loading your workspace</span></div>;
}
