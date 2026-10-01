import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() { return <div className="space-y-5"><Skeleton className="h-10 w-48" /><div className="grid gap-4 md:grid-cols-2">{[1,2,3,4].map((number) => <Skeleton key={number} className="h-44 w-full" />)}</div></div>; }
