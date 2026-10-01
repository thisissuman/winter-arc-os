import { HabitPage } from "@/features/habits/habit-page";

export const metadata = { title: "Habits" };
export default async function HabitsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return <HabitPage query={await searchParams} />;
}
