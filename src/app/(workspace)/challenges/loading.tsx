import { Skeleton } from "@/components/ui/skeleton";

export default function ChallengesLoading() {
  return <div aria-busy="true" role="status" aria-label="Loading challenges" className="space-y-7">
    <Skeleton className="h-9 w-48" />
    <Skeleton className="h-5 max-w-md" />
    <div className="space-y-4"><Skeleton className="h-36 w-full" /><Skeleton className="h-36 w-full" /></div>
  </div>;
}
