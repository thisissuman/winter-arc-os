import { ChallengeList } from "@/features/challenges/challenge-pages";

export const metadata = { title: "Challenges" };
export default async function ChallengesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return <ChallengeList query={await searchParams} />;
}
