"use client";
import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormFeedback } from "@/components/form-feedback";
import { initialFormState } from "@/lib/auth/validation";
import { login, signup, requestRecovery, resetPassword } from "./actions";

type Kind = "login" | "signup" | "recovery" | "reset";
const content = {
  login: { title: "Welcome back.", description: "A little intention. A fresh start to the day.", submit: "Sign in", action: login },
  signup: { title: "Make room for progress.", description: "Create your own private workspace.", submit: "Create account", action: signup },
  recovery: { title: "Find your way back.", description: "We'll email a link to reset your password.", submit: "Send recovery link", action: requestRecovery },
  reset: { title: "Choose a new password.", description: "Use a strong password you haven't used here before.", submit: "Update password", action: resetPassword },
} as const;

export function AuthForm({ kind, configured, notice }: { kind: Kind; configured: boolean; notice?: string }) {
  const details = content[kind];
  const [state, action, pending] = useActionState(details.action, initialFormState);
  const fields = [
    ...(kind === "signup" ? [{ name: "displayName", label: "Your name", type: "text", autoComplete: "name", placeholder: "How should we call you?" }] : []),
    ...(kind !== "reset" ? [{ name: "email", label: "Email address", type: "email", autoComplete: "email", placeholder: "you@example.com" }] : []),
    ...(kind !== "recovery" ? [{ name: "password", label: kind === "reset" ? "New password" : "Password", type: "password", autoComplete: kind === "login" ? "current-password" : "new-password", placeholder: kind === "login" ? "Enter your password" : "At least 12 characters" }] : []),
    ...(kind === "reset" ? [{ name: "confirmPassword", label: "Confirm password", type: "password", autoComplete: "new-password", placeholder: "Repeat your new password" }] : []),
  ];
  return <section id="auth-form" tabIndex={-1} className="w-full max-w-sm" aria-labelledby="auth-title">
    <h1 id="auth-title" className="text-3xl font-semibold tracking-[-0.03em]">{details.title}</h1>
    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{details.description}</p>
    {notice && <p role="alert" className="mt-5 rounded-md border p-3 text-sm text-warning">{notice}</p>}
    {!configured && <div className="mt-5 rounded-md border p-3 text-sm leading-relaxed text-warning">Account service isn&apos;t configured yet. Add your Supabase project details using the setup instructions in README.md.</div>}
    <form action={action} className="mt-8 space-y-5" noValidate>
      <fieldset disabled={pending || !configured} className="space-y-5 disabled:opacity-60">
        {fields.map((field) => {
          const errors = state.fieldErrors?.[field.name];
          return <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm">{field.label}</Label>
            <Input id={field.name} name={field.name} type={field.type} autoComplete={field.autoComplete} placeholder={field.placeholder} required maxLength={field.name === "email" ? 254 : field.name === "displayName" ? 80 : 128} aria-invalid={Boolean(errors?.length)} aria-describedby={errors?.length ? `${field.name}-error` : undefined} className="h-11 bg-card px-3 text-sm" />
            {errors?.length && <p id={`${field.name}-error`} className="text-sm text-destructive">{errors[0]}</p>}
          </div>;
        })}
        {kind === "login" && <div className="text-right"><Link href="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link></div>}
        <Button type="submit" className="h-11 w-full text-sm font-medium" disabled={pending || !configured}>
          {pending ? <><LoaderCircle className="size-4 animate-spin" aria-hidden="true" />Please wait</> : <>{details.submit}<ArrowRight className="ml-auto size-4" aria-hidden="true" /></>}
        </Button>
      </fieldset>
      <FormFeedback state={state} />
    </form>
    <p className="mt-7 text-center text-sm text-muted-foreground">
      {kind === "login" ? <>New here? <Link className="text-foreground underline underline-offset-4" href="/signup">Create an account</Link></> : kind === "signup" ? <>Already have an account? <Link className="text-foreground underline underline-offset-4" href="/login">Sign in</Link></> : <Link href="/login" className="text-foreground underline underline-offset-4">Back to sign in</Link>}
    </p>
  </section>;
}
