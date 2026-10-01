import { PageHeader } from "@/components/tracking/page-header";
import { TrackingUnavailable } from "@/components/tracking/tracking-unavailable";
import { loadTrackingSnapshot, TrackingSetupError } from "@/features/tracking/queries";
import { OnboardingForm } from "@/features/onboarding/onboarding-form";

export const metadata = { title: "Workspace setup" };
export default async function OnboardingPage() {
  let snapshot;
  try { snapshot = await loadTrackingSnapshot(); }
  catch (error) { if (error instanceof TrackingSetupError) return <TrackingUnavailable />; throw error; }
  return <div className="max-w-2xl"><PageHeader title={snapshot.onboardingComplete ? "Workspace setup" : "Make this space yours"} description="Confirm your calendar, then choose your own trackers or an optional starting point." /><div className="mt-8"><OnboardingForm timezone={snapshot.timezone} weekStartsOn={snapshot.weekStartsOn} complete={snapshot.onboardingComplete} /></div></div>;
}
