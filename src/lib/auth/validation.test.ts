import { describe, expect, it } from "vitest";
import { safeRedirect } from "./redirect";
import { loginSchema, passwordSchema, profileSchema, signupSchema } from "./validation";

describe("authentication validation", () => {
  it("accepts valid login without imposing signup rules on an existing password", () => {
    expect(loginSchema.safeParse({ email: "person@example.com", password: "existing" }).success).toBe(true);
  });
  it("rejects short signup passwords, invalid email, and oversized profile names", () => {
    expect(signupSchema.safeParse({ displayName: "Person", email: "bad", password: "short" }).success).toBe(false);
    expect(signupSchema.safeParse({ displayName: "a".repeat(81), email: "a@example.com", password: "a-long-password" }).success).toBe(false);
  });
  it("requires matching recovery passwords", () => {
    expect(passwordSchema.safeParse({ password: "a-long-password", confirmPassword: "different" }).success).toBe(false);
  });
  it("allows clearing an optional profile name while signup still requires a name", () => {
    expect(profileSchema.parse({ displayName: "  " }).displayName).toBe("");
    expect(profileSchema.safeParse({ displayName: "a".repeat(81) }).success).toBe(false);
    expect(signupSchema.safeParse({ displayName: "", email: "a@example.com", password: "a-long-password" }).success).toBe(false);
  });
});

describe("confirmation redirects", () => {
  it.each(["https://attacker.example", "//attacker.example", "/\\attacker", "/auth/confirm", "/today?next=https://evil.example", null])("rejects unsafe destination %s", (value) => {
    expect(safeRedirect(value)).toBe("/today");
  });
  it("allows explicitly supported local destinations", () => {
    expect(safeRedirect("/settings")).toBe("/settings");
    expect(safeRedirect("/reset-password")).toBe("/reset-password");
  });
});
