import { requireAccount } from "@/lib/auth/session";
import { ProfileForm, AppearanceForm, CalendarForm } from "@/features/settings/settings-forms";
import { InstallControl } from "@/features/settings/install-control";
import { LogoutButton } from "@/components/shell/logout-button";
import Link from "next/link";
import { PageHeader } from "@/components/tracking/page-header";
export const metadata = { title: "Settings" };
export default async function SettingsPage() {
  const { profile, preferences, email } = await requireAccount();
  return <>
    <PageHeader title="Settings" description="Your workspace, your preferences." />
    <section aria-labelledby="profile-title" className="grid gap-6 border-b py-8 lg:grid-cols-[1fr_1.6fr]"><div><h2 id="profile-title" className="text-base font-medium">Profile</h2><p className="mt-2 text-sm text-muted-foreground">The name you see in your workspace.</p></div><ProfileForm name={profile.display_name} email={email} /></section>
    <section aria-labelledby="appearance-title" className="grid gap-6 border-b py-8 lg:grid-cols-[1fr_1.6fr]"><div><h2 id="appearance-title" className="text-base font-medium">Appearance</h2><p className="mt-2 text-sm text-muted-foreground">Choose the light that works for you.</p></div><AppearanceForm theme={preferences.theme} /></section>
    <section aria-labelledby="calendar-title" className="grid gap-6 border-b py-8 lg:grid-cols-[1fr_1.6fr]"><div><h2 id="calendar-title" className="text-base font-medium">Calendar</h2><p className="mt-2 text-sm text-muted-foreground">How your future days are organized.</p></div><CalendarForm timezone={preferences.timezone} weekStartsOn={preferences.week_starts_on} /></section>
    <section aria-labelledby="tracking-title" className="grid gap-6 border-b py-8 lg:grid-cols-[1fr_1.6fr]"><div><h2 id="tracking-title" className="text-base font-medium">Tracking</h2><p className="mt-2 text-sm text-muted-foreground">Calendar setup, privacy, frequency targets, and score policies.</p></div><div className="flex flex-wrap gap-4 text-sm"><Link href="/onboarding" className="inline-flex min-h-11 items-center text-primary underline">Calendar and starters</Link><Link href="/settings/tracking" className="inline-flex min-h-11 items-center text-primary underline">Tracking settings</Link></div></section>
    <section aria-labelledby="organization-title" className="grid gap-6 border-b py-8 lg:grid-cols-[1fr_1.6fr]"><div><h2 id="organization-title" className="text-base font-medium">Workspace management</h2><p className="mt-2 text-sm text-muted-foreground">Definitions stay shared across your challenges.</p></div><div className="flex flex-wrap gap-4 text-sm">{[["/settings/organization", "Life areas and categories"], ["/habits", "Habits and schedules"], ["/metrics", "Metrics and targets"], ["/challenges", "Challenges"]].map(([href,label]) => <Link key={href} href={href} className="inline-flex min-h-11 items-center text-primary underline">{label}</Link>)}</div></section>
    <section aria-labelledby="data-title" className="grid gap-6 border-b py-8 lg:grid-cols-[1fr_1.6fr]"><div><h2 id="data-title" className="text-base font-medium">Your data</h2><p className="mt-2 text-sm text-muted-foreground">Private downloads and permanent deletion.</p></div><Link href="/settings/data" className="inline-flex min-h-11 items-center text-sm text-primary underline">Export and deletion controls</Link></section>
    <section aria-labelledby="install-title" className="grid gap-6 border-b py-8 lg:grid-cols-[1fr_1.6fr]"><div><h2 id="install-title" className="text-base font-medium">Install the app</h2><p className="mt-2 text-sm text-muted-foreground">Open your workspace from your home screen.</p></div><InstallControl /></section>
    <section aria-labelledby="session-title" className="grid gap-6 py-8 lg:grid-cols-[1fr_1.6fr]"><div><h2 id="session-title" className="text-base font-medium">Session</h2><p className="mt-2 text-sm text-muted-foreground">Sign out on this device.</p></div><div className="max-w-[160px]"><LogoutButton /></div></section>
  </>;
}
