import { z } from "zod";
import { businessDateSchema } from "@/features/tracking/validation";

const uuid = z.uuid();
const optionalId = z.preprocess((value) => value === "" || value == null ? null : value, uuid.nullable());
const revision = z.preprocess((value) => value === "" || value == null ? null : value, z.coerce.number().int().positive().nullable());
const optionalDate = z.preprocess((value) => value === "" || value == null ? null : value, businessDateSchema.nullable());
const optionalSeconds = z.preprocess((value) => value === "" || value == null ? null : value, z.coerce.number().int().min(0).max(604800).nullable());
const optionalValue = z.preprocess((value) => value === "" || value == null ? null : value, z.coerce.number().finite().min(-1e12).max(1e12).nullable());
const checked = z.preprocess((value) => value === true || value === "on" || value === "true", z.boolean());

export const taskSchema = z.object({
  id: optionalId, expectedRevision: revision, title: z.string().trim().min(1).max(160), notes: z.string().trim().max(4000),
  date: businessDateSchema, status: z.enum(["todo", "in_progress", "completed"]), priority: z.enum(["low", "normal", "high"]),
  categoryId: optionalId, goalId: optionalId, challengeId: optionalId,
  estimatedSeconds: optionalSeconds, actualSeconds: optionalSeconds, isPrivate: checked, delete: z.boolean(),
});
export const taskStatusSchema = z.object({ id: uuid, status: z.enum(["todo", "in_progress", "completed"]), expectedRevision: z.number().int().positive() });
export const taskOrderSchema = z.object({ id: uuid, direction: z.enum(["up", "down"]), expectedRevision: z.number().int().positive() });
export const carrySchema = z.object({ operationId: uuid, sourceDate: businessDateSchema, targetDate: businessDateSchema, mode: z.enum(["move", "copy"]) })
  .refine((value) => value.targetDate > value.sourceDate, { path: ["targetDate"], message: "Choose a date after the source day." });

export const goalSchema = z.object({
  id: optionalId, expectedRevision: revision, title: z.string().trim().min(1).max(160), description: z.string().trim().max(4000),
  categoryId: optionalId, challengeId: optionalId, targetDate: optionalDate,
  status: z.enum(["active", "paused", "completed", "archived"]), progressMode: z.enum(["manual", "milestone", "metric"]),
  manualPercent: z.coerce.number().finite().min(0).max(100), metricId: optionalId,
  metricAggregation: z.preprocess((value) => value === "" || value == null ? null : value, z.enum(["latest", "sum", "count"]).nullable()),
  metricStartDate: optionalDate, metricEndDate: optionalDate, metricBaseline: optionalValue, metricTarget: optionalValue, isPrivate: checked,
}).superRefine((value, context) => {
  if (value.progressMode !== "metric") return;
  if (!value.metricId || !value.metricAggregation || !value.metricStartDate || value.metricBaseline === null || value.metricTarget === null) {
    context.addIssue({ code: "custom", path: ["metricId"], message: "Choose a metric, aggregation, start date, baseline, and target." });
  }
  if (value.metricStartDate && value.metricEndDate && value.metricEndDate < value.metricStartDate) context.addIssue({ code: "custom", path: ["metricEndDate"], message: "End date must follow the start date." });
  if (value.metricBaseline !== null && value.metricBaseline === value.metricTarget) context.addIssue({ code: "custom", path: ["metricTarget"], message: "Baseline and target must differ." });
});
export const milestoneSchema = z.object({
  id: optionalId, goalId: uuid, expectedRevision: revision, title: z.string().trim().min(1).max(160), completed: checked, delete: z.boolean(),
});
