import { z } from "zod";
import { businessDateSchema } from "@/features/tracking/validation";

const uuid = z.uuid();
const nullableUuid = z.preprocess((value) => value === "" || value == null ? null : value, uuid.nullable());
const revision = z.preprocess((value) => value === "" || value == null ? null : value, z.coerce.number().int().positive().nullable());
const duration = z.preprocess((value) => value === "" || value == null ? null : value, z.coerce.number().int().min(60).max(86400).nullable());
const optionalIso = z.preprocess((value) => value === "" || value == null ? null : value, z.iso.datetime({ offset: true }).nullable());
const note = z.string().trim().max(4000).default("");

export const sleepSchema = z.object({
  date: businessDateSchema, expectedRevision: revision, clear: z.boolean(),
  sleepStartAt: optionalIso, wakeAt: optionalIso,
  durationSeconds: duration, quality: z.preprocess((value) => value === "" || value == null ? null : value, z.coerce.number().int().min(1).max(5).nullable()), notes: note,
}).superRefine((input, context) => {
  if (input.clear) return;
  if (input.durationSeconds === null) context.addIssue({ code: "custom", path: ["durationSeconds"], message: "Enter a sleep duration." });
  if ((input.sleepStartAt === null) !== (input.wakeAt === null)) context.addIssue({ code: "custom", path: ["wakeAt"], message: "Enter both sleep and wake times, or use duration only." });
  if (input.sleepStartAt && input.wakeAt && Math.abs((Date.parse(input.wakeAt) - Date.parse(input.sleepStartAt)) / 1000 - (input.durationSeconds ?? 0)) >= 1) context.addIssue({ code: "custom", path: ["durationSeconds"], message: "Duration must match the entered sleep and wake times." });
});

export const exerciseSchema = z.object({ id: nullableUuid, expectedUpdatedAt: optionalIso, name: z.string().trim().min(1).max(120), muscleGroup: z.string().trim().min(1).max(80), archive: z.boolean() });
const setSchema = z.object({ weightKg: z.number().finite().min(0).max(2000), reps: z.number().int().min(1).max(1000), rpe: z.number().finite().min(1).max(10).nullable() });
const workoutExerciseSchema = z.object({ exerciseId: uuid, notes: z.string().trim().max(1000), sets: z.array(setSchema).min(1).max(50) });
export const workoutSchema = z.object({
  id: nullableUuid, expectedRevision: revision, date: businessDateSchema, name: z.string().trim().min(1).max(120),
  durationSeconds: duration, notes: note, status: z.enum(["draft", "completed"]), challengeId: nullableUuid,
  exercises: z.array(workoutExerciseSchema).max(30),
}).superRefine((input, context) => {
  if (input.status === "completed" && input.exercises.length === 0) context.addIssue({ code: "custom", path: ["exercises"], message: "Add at least one exercise to complete a workout." });
});
export const copyWorkoutSchema = z.object({ sourceId: uuid, date: businessDateSchema, operationId: uuid });
export const deleteWorkoutSchema = z.object({ id: uuid, expectedRevision: z.number().int().positive() });
export const fitnessSetupSchema = z.object({ sleepTarget: z.number().finite().positive().max(24).nullable() });
