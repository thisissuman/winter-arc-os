import { z } from "zod";
import { isBusinessDate } from "@/lib/dates";
export const habitSchema = z.object({
  id: z.uuid().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Give your habit a name.")
    .max(80, "Use 80 characters or fewer."),
  weekdays: z
    .array(z.number().int().min(1).max(7))
    .min(1, "Choose at least one day.")
    .max(7)
    .refine((d) => new Set(d).size === d.length, "Choose each day once."),
  expectedRevision: z.number().int().nonnegative(),
});
export const completionSchema = z.object({
  habitId: z.uuid(),
  businessDate: z.string().refine(isBusinessDate),
  completed: z.boolean(),
  expectedRevision: z.number().int().nonnegative(),
});
export const identitySchema = z.object({
  habitId: z.uuid(),
  expectedRevision: z.number().int().positive(),
});
