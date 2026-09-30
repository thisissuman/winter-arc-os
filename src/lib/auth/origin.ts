import "server-only";

export function applicationOrigin() {
  const configured = process.env.APP_ORIGIN;
  if (!configured) throw new Error("APP_ORIGIN must be configured for email authentication.");
  const parsed = new URL(configured);
  if (!["https:", "http:"].includes(parsed.protocol) || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("APP_ORIGIN must be an HTTP(S) origin without a path or credentials.");
  }
  if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(parsed.hostname)) {
    throw new Error("A hosted production APP_ORIGIN must use HTTPS.");
  }
  return parsed.origin;
}
