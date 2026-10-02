import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() { return <div role="status" aria-label="Loading metrics" className="space-y-6"><Skeleton className="h-20 w-full" /><Skeleton className="h-60 w-full" /><Skeleton className="h-60 w-full" /></div>; }
