import { requireAccount } from "@/lib/auth/session";
import { ProfileForm, AppearanceForm } from "@/features/settings/settings-forms";
import { LogoutButton } from "@/components/shell/logout-button";
import Link from "next/link";
export const metadata = { title: "Settings" };
export default async function SettingsPage() {
  const { profile, preferences, email } = await requireAccount();
  return <>
    <header className="border-b pb-7"><p className="mb-2 text-sm text-muted-foreground">Your workspace, your preferences</p><h1 className="text-3xl font-semibold tracking-[-0.03em]">Settings</h1></header>
    <section aria-labelledby="profile-title" className="grid gap-6 border-b py-8 lg:grid-cols-[1fr_1.6fr]"><div><h2 id="profile-title" className="text-base font-medium">Profile</h2><p className="mt-2 text-sm text-muted-foreground">The name you see in your workspace.</p></div><ProfileForm name={profile.display_name} email={email} /></section>
    <section aria-labelledby="appearance-title" className="grid gap-6 border-b py-8 lg:grid-cols-[1fr_1.6fr]"><div><h2 id="appearance-title" className="text-base font-medium">Appearance</h2><p className="mt-2 text-sm text-muted-foreground">Choose the light that works for you.</p></div><AppearanceForm theme={preferences.theme} /></section>
    <section aria-labelledby="calendar-title" className="grid gap-6 border-b py-8 lg:grid-cols-[1fr_1.6fr]"><div><h2 id="calendar-title" className="text-base font-medium">Calendar</h2><p className="mt-2 text-sm text-muted-foreground">How your days are organized.</p></div><dl className="max-w-md space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Timezone</dt><dd>{preferences.timezone}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Week starts</dt><dd>{["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][preferences.week_starts_on - 1]}</dd></div></dl></section>
    <section aria-labelledby="tracking-title" className="grid gap-6 border-b py-8 lg:grid-cols-[1fr_1.6fr]"><div><h2 id="tracking-title" className="text-base font-medium">Tracking</h2><p className="mt-2 text-sm text-muted-foreground">Calendar setup, privacy, frequency targets, and score policies.</p></div><div className="flex flex-wrap gap-4 text-sm"><Link href="/onboarding" className="inline-flex min-h-11 items-center text-primary underline">Calendar and starters</Link><Link href="/settings/tracking" className="inline-flex min-h-11 items-center text-primary underline">Tracking settings</Link></div></section>
    <section aria-labelledby="session-title" className="grid gap-6 py-8 lg:grid-cols-[1fr_1.6fr]"><div><h2 id="session-title" className="text-base font-medium">Session</h2><p className="mt-2 text-sm text-muted-foreground">Sign out on this device.</p></div><div className="max-w-[160px]"><LogoutButton /></div></section>
  </>;
}
