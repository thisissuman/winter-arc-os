const destinations = new Set(["/today", "/settings", "/reset-password"]);

export function safeRedirect(value: string | null | undefined, fallback = "/today") {
  return value && destinations.has(value) ? value : fallback;
}
