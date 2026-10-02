import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() { return <div role="status" aria-label="Loading organization" className="space-y-5"><Skeleton className="h-20 w-full" /><Skeleton className="h-64 w-full" /></div>; }
