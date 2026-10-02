import { z } from "zod";

const password = z.string().min(1, "Enter your current password.").max(1024);
export const workspaceDeletionSchema = z.object({ password, confirmation: z.literal("DELETE MY DATA") }).strict();
export const accountDeletionSchema = z.object({ password, confirmation: z.literal("DELETE MY ACCOUNT") }).strict();
export const organizationSchema = z.object({
  kind: z.enum(["area", "category"]),
  id: z.union([z.literal(""), z.string().uuid()]),
  expectedUpdatedAt: z.string().max(80),
  name: z.string().trim().min(1).max(80),
  position: z.coerce.number().int().min(0).max(2000000000),
  areaId: z.union([z.literal(""), z.string().uuid()]),
  archived: z.boolean(),
});
