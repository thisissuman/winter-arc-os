import { z } from "zod";

export const businessDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a calendar date.").refine((value) => {
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}, "Use a valid calendar date.");
const id = z.uuid("Choose a valid record.");
const optionalId = z.preprocess((value) => value === "" || value == null ? null : value, id.nullable());
const optionalNumber = z.preprocess((value) => value === "" || value == null ? null : value, z.coerce.number().finite().nullable());
const checked = z.preprocess((value) => value === true || value === "on" || value === "true", z.boolean());
const text = z.string().trim().min(1, "Enter a name.").max(120);
const notes = z.string().trim().max(4000).default("");
const revision = z.number().int().positive().nullable();
const expectedUpdatedAt = z.preprocess((value) => value === "" || value == null ? null : value, z.iso.datetime({ offset: true }).nullable());
const base = { id: optionalId, expectedUpdatedAt };
const activeFrom = z.preprocess((value) => value === "" || value == null ? undefined : value, businessDateSchema.optional());
const categoryId = optionalId;

export const challengeSchema = z.object({
  ...base, title: text, description: notes, startDate: businessDateSchema, endDate: businessDateSchema,
  status: z.enum(["upcoming", "active", "completed", "archived"]),
  color: z.preprocess((value) => value === "" || value == null ? null : value, z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a six-digit colour.").nullable()),
  icon: z.preprocess((value) => value === "" || value == null ? null : value, z.string().max(50).nullable()),
  habitIds: z.array(id).max(200), metricIds: z.array(id).max(200), frequencyTargetIds: z.array(id).max(200),
}).refine((input) => input.endDate >= input.startDate, { message: "End date must follow start date.", path: ["endDate"] });
export const habitSchema = z.object({
  ...base, name: text, description: notes, categoryId, isPrivate: checked, activeFrom,
  icon: z.preprocess((value) => value === "" || value == null ? null : value, z.string().trim().max(50).nullable()),
  activeUntil: z.preprocess((value) => value === "" || value == null ? null : value, businessDateSchema.nullable()),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "anytime"]),
  dosageAmount: optionalNumber.refine((value) => value == null || value > 0, "Use a positive dose."),
  dosageUnit: z.string().trim().max(30).default(""),
  frequency: z.enum(["DAILY", "WEEKDAYS", "SPECIFIC_DAYS", "TIMES_PER_WEEK", "TIMES_PER_MONTH", "CUSTOM"]),
  requiredCount: z.coerce.number().int().min(1).max(1000), weekdays: z.array(z.coerce.number().int().min(1).max(7)).max(7),
  intervalDays: optionalNumber.refine((value) => value == null || Number.isInteger(value) && value >= 1 && value <= 365, "Use an interval of 1–365 days."),
  anchorDate: z.preprocess((value) => value === "" || value == null ? null : value, businessDateSchema.nullable()),
}).superRefine((input, context) => {
  if (input.frequency === "SPECIFIC_DAYS" && input.weekdays.length === 0) context.addIssue({ code: "custom", path: ["weekdays"], message: "Select at least one weekday." });
  if (input.frequency === "CUSTOM" && (input.intervalDays == null || input.anchorDate == null)) context.addIssue({ code: "custom", path: ["intervalDays"], message: "Set an interval and anchor date." });
  if (input.dosageAmount != null && !input.dosageUnit) context.addIssue({ code: "custom", path: ["dosageUnit"], message: "Enter the dose unit." });
});
export const metricSchema = z.object({
  ...base, name: text, description: notes, categoryId, isPrivate: checked, activeFrom,
  unit: z.string().trim().min(1).max(30), source: z.enum(["manual", "study", "sleep"]), aggregation: z.enum(["sum", "latest", "average"]),
  targetPeriod: z.enum(["daily", "weekly", "monthly"]), direction: z.enum(["minimum", "maximum"]),
  target: optionalNumber.refine((value) => value == null || value > 0, "Use a positive target or leave it empty for observation."),
});
export const frequencySchema = z.object({
  ...base, name: text, description: notes, categoryId, isPrivate: checked, activeFrom,
  source: z.enum(["metric_threshold", "workouts", "study_sessions"]), metricId: optionalId, countMode: z.enum(["distinct_days", "sessions"]),
  period: z.enum(["weekly", "monthly"]), quota: z.coerce.number().int().min(1).max(1000),
  threshold: optionalNumber,
}).superRefine((input, context) => {
  if (input.source === "metric_threshold" && (input.metricId === null || input.countMode !== "distinct_days" || input.threshold === null || input.threshold <= 0)) context.addIssue({ code: "custom", path: ["threshold"], message: "Choose a metric and positive qualifying threshold." });
  if (input.source !== "metric_threshold" && (input.metricId !== null || input.countMode !== "sessions" || input.threshold !== null)) context.addIssue({ code: "custom", path: ["source"], message: "Session sources cannot use a metric threshold." });
});
export const definitionActionSchema = z.object({ id, expectedUpdatedAt });
export const permanentDeleteSchema = definitionActionSchema.extend({ confirmation: z.literal("DELETE", "Type DELETE to permanently remove this history.") });
export const selectChallengeSchema = z.object({ challengeId: optionalId });
export const associationSchema = z.object({ challengeId: id, expectedUpdatedAt, habitIds: z.array(id).max(200), metricIds: z.array(id).max(200), frequencyTargetIds: z.array(id).max(200) });
export const habitLogSchema = z.object({
  habitId: id, date: businessDateSchema, status: z.enum(["completed", "missed", "skipped", "clear"]),
  completionCount: z.number().int().min(0).max(10000), notes: notes.optional(), expectedRevision: revision,
}).refine((input) => input.status === "completed" ? input.completionCount > 0 : input.completionCount === 0, { message: "Completed entries need a positive count; other states use zero.", path: ["completionCount"] });
export const metricLogSchema = z.object({ metricId: id, date: businessDateSchema, value: z.number().finite().min(0).max(1e12).nullable(), notes: notes.optional(), expectedRevision: revision });
export const metricIncrementSchema = z.object({ metricId: id, date: businessDateSchema, amount: z.number().finite().positive().max(1e9), operationId: id });
const scoreWeightSchema = z.object({ scoreCategoryId: id, weight: z.number().finite().min(0).max(1000) });
const scoreItemSchema = z.object({ scoreCategoryId: id, weight: z.number().finite().positive().max(1000), habitId: id.optional(), metricId: id.optional(), frequencyTargetId: id.optional() }).refine((item) => [item.habitId, item.metricId, item.frequencyTargetId].filter(Boolean).length === 1, "Assign exactly one source per item.");
export const scorePolicySchema = z.object({ name: text, period: z.enum(["daily", "weekly", "monthly"]), weights: z.array(scoreWeightSchema).min(1).max(100), items: z.array(scoreItemSchema).max(500) }).superRefine((input, context) => {
  if (!input.weights.some((weight) => weight.weight > 0)) context.addIssue({ code: "custom", path: ["weights"], message: "Give at least one category a positive weight." });
  if (new Set(input.weights.map((weight) => weight.scoreCategoryId)).size !== input.weights.length) context.addIssue({ code: "custom", path: ["weights"], message: "Each category can appear once." });
  const sources = input.items.map((item) => item.habitId ? `habit:${item.habitId}` : item.metricId ? `metric:${item.metricId}` : `frequency:${item.frequencyTargetId}`);
  if (new Set(sources).size !== sources.length) context.addIssue({ code: "custom", path: ["items"], message: "Each source can be scored once per policy." });
  if (input.items.some((item) => !input.weights.some((weight) => weight.scoreCategoryId === item.scoreCategoryId))) context.addIssue({ code: "custom", path: ["items"], message: "Every item's category needs a configured weight." });
});
export const scoreCategorySchema = z.object({ ...base, name: text, position: z.coerce.number().int().min(0).max(1000) });
export const onboardingSchema = z.object({
  timezone: z.string().min(1).max(80).refine((value) => { try { new Intl.DateTimeFormat("en", { timeZone: value }); return true; } catch { return false; } }, "Choose a valid timezone."),
  weekStartsOn: z.coerce.number().int().min(1).max(7), applyStarter: checked,
  stepThreshold: optionalNumber.refine((value) => value == null || Number.isInteger(value) && value > 0, "Use a positive whole number of steps."),
  sleepTarget: optionalNumber.refine((value) => value == null || value > 0 && value <= 24, "Use hours greater than zero and up to 24."),
  studyDailyMinutes: optionalNumber.refine((value) => value == null || value > 0 && value <= 1440, "Use minutes greater than zero and up to 1440."),
});
