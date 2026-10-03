import { z } from "zod";
import { appearanceSchema } from "@/lib/auth/validation";
export const calendarSchema = z.object({
  timezone: z
    .string()
    .min(1)
    .max(80)
    .refine((value) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: value }).format();
        return true;
      } catch {
        return false;
      }
    }),
  weekStartsOn: z.coerce.number().int().min(1).max(7),
});
export const preferencesSchema = calendarSchema.extend({
  ...appearanceSchema.shape,
  privacy: z.enum(["true", "false"]),
});
