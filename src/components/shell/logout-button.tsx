"use client";
import { useActionState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/actions";
import { initialFormState } from "@/lib/auth/validation";
export function LogoutButton() {
  const [state, action, pending] = useActionState(logout, initialFormState);
  return <form action={action}>
    <Button variant="ghost" type="submit" disabled={pending} className="min-h-11 w-full justify-start gap-3 px-3 text-muted-foreground"><LogOut className="size-4" aria-hidden="true" />{pending ? "Signing out…" : "Sign out"}</Button>
    {state.message && <p role="alert" className="mt-2 text-xs text-destructive">{state.message}</p>}
  </form>;
}
