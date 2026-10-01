import { z } from "zod";
import { businessDateSchema } from "@/features/tracking/validation";

const uuid = z.uuid();
const nullableUuid = z.preprocess((value) => value === "" || value == null ? null : value, uuid.nullable());
const revision = z.preprocess((value) => value === "" || value == null ? null : value, z.coerce.number().int().positive().nullable());
const optionalIso = z.preprocess((value) => value === "" || value == null ? null : value, z.iso.datetime({ offset: true }).nullable());
const optionalTarget = z.preprocess((value) => value === "" || value == null ? null : value, z.coerce.number().finite().positive().max(10080).nullable());

export const careerSetupSchema = z.object({ dailyMinutes: optionalTarget, weeklyMinutes: optionalTarget });
export const studyCategorySchema = z.object({
  id: nullableUuid, expectedUpdatedAt: optionalIso, categoryId: nullableUuid,
  name: z.string().trim().min(1).max(120), position: z.coerce.number().int().min(0).max(10000), archive: z.boolean(),
});
export const studySessionSchema = z.object({
  id: nullableUuid, expectedRevision: revision, categoryId: nullableUuid, challengeId: nullableUuid,
  date: businessDateSchema, durationSeconds: z.coerce.number().int().min(60).max(604800),
  startAt: optionalIso, endAt: optionalIso, topic: z.string().trim().max(200), notes: z.string().trim().max(4000), delete: z.boolean(),
}).superRefine((input, context) => {
  if (input.delete) return;
  if (!input.categoryId) context.addIssue({ code: "custom", path: ["categoryId"], message: "Choose a study category." });
  if ((input.startAt === null) !== (input.endAt === null)) context.addIssue({ code: "custom", path: ["endAt"], message: "Enter both start and end times, or neither." });
  if (input.startAt && input.endAt && Math.abs((Date.parse(input.endAt) - Date.parse(input.startAt)) / 1000 - input.durationSeconds) >= 1) context.addIssue({ code: "custom", path: ["durationSeconds"], message: "Duration must match the start and end times." });
});
export const startTimerSchema = z.object({ categoryId: uuid, challengeId: nullableUuid, topic: z.string().trim().max(200), notes: z.string().trim().max(4000) });
export const controlTimerSchema = z.object({ id: uuid, action: z.enum(["pause", "resume", "finish", "discard"]), expectedRevision: z.number().int().positive() });
