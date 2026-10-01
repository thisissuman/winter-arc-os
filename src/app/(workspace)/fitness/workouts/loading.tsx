import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() { return <div className="space-y-5"><Skeleton className="h-10 w-48" />{[1,2,3].map((number) => <Skeleton key={number} className="h-32 w-full" />)}</div>; }
