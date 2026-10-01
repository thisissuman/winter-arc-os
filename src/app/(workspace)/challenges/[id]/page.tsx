import { ChallengeDetail } from "@/features/challenges/challenge-pages";

export const metadata = { title: "Challenge" };
export default async function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  return <ChallengeDetail id={(await params).id} />;
}
