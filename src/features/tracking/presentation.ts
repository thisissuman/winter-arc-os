type PrivacyContext = { privacyMode: boolean };
type PrivateLabel = { name?: string; title?: string; is_private?: boolean };
export function trackerLabel(tracker: PrivateLabel, context: PrivacyContext) {
  return context.privacyMode && tracker.is_private ? "Private tracker" : tracker.name ?? tracker.title ?? "Tracker";
}
export function trackerDescription(tracker: { description?: string; is_private?: boolean }, context: PrivacyContext) {
  return context.privacyMode && tracker.is_private ? "Details hidden by Privacy Mode." : tracker.description ?? "";
}
export function privateNotes(notes: string, isPrivate: boolean, context: PrivacyContext) {
  return context.privacyMode && isPrivate ? "" : notes;
}
export function displayValue(value: number | null, unit: string) {
  if (value === null) return "Not logged";
  if (unit === "ml") return `${new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value / 1000)} L`;
  return `${new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value)}${unit ? ` ${unit}` : ""}`;
}
