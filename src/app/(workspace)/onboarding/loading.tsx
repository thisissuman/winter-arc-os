import { Skeleton } from "@/components/ui/skeleton";

export default function OnboardingLoading() {
  return <div aria-busy="true" role="status" aria-label="Loading workspace setup" className="max-w-2xl space-y-7">
    <Skeleton className="h-9 w-56" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-80 w-full" />
  </div>;
}
