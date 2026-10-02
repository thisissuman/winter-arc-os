import { z } from "zod";
import { isBusinessDate } from "@/features/tracking/dates";

const date = z.string().refine(isBusinessDate, "Choose a valid period date.");
const text = z.string().max(4000, "Keep each response within 4,000 characters.");
const rating = z.union([z.literal(""), z.enum(["1", "2", "3", "4", "5"])]).transform((value) => value === "" ? null : Number(value));
const revision = z.union([z.literal(""), z.string().regex(/^\d+$/)]).transform((value) => value === "" ? null : Number(value));

export const weeklyReviewSchema = z.object({
  periodStart: date, expectedRevision: revision,
  wins: text, difficulties: text, lessons: text, nextWeekChanges: text,
  energy: rating, focus: rating, motivation: rating, stress: rating, mood: rating,
});
export const monthlyReflectionSchema = z.object({
  periodStart: date, expectedRevision: revision,
  biggestWins: text, biggestFailures: text, habitsImproved: text, habitsSlipped: text,
  fitnessProgress: text, careerProgress: text, changesNextMonth: text, notes: text,
});
