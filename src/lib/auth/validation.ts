import { z } from "zod";

const email = z.email("Enter a valid email address.").trim().max(254);
const password = z.string().min(12, "Use at least 12 characters.").max(128, "Use no more than 128 characters.");

export const loginSchema = z.object({ email, password: z.string().min(1, "Enter your password.").max(128) });
export const signupSchema = z.object({
  displayName: z.string().trim().min(1, "Enter your name.").max(80, "Use no more than 80 characters."),
  email,
  password,
});
export const recoverySchema = z.object({ email });
export const passwordSchema = z.object({ password, confirmPassword: z.string() }).refine(
  (input) => input.password === input.confirmPassword,
  { message: "Passwords must match.", path: ["confirmPassword"] },
);
export const profileSchema = z.object({ displayName: z.string().trim().min(1, "Enter your name.").max(80) });
export const appearanceSchema = z.object({ theme: z.enum(["dark", "light", "system"]) });

export type FormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
export const initialFormState: FormState = { status: "idle" };
