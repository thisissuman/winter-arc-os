import { requireAccount } from "@/lib/auth/session";
import {
  ProfileForm,
  PreferencesForm,
} from "@/features/settings/settings-forms";
import {
  ExportControl,
  DeleteDataForm,
  DeleteAccountForm,
} from "@/features/settings/data-forms";
import { InstallControl } from "@/features/settings/install-control";
import { LogoutButton } from "@/components/shell/logout-button";
import { isAccountDeletionConfigured } from "@/lib/supabase/admin";
export const metadata = { title: "Settings" };
export default async function SettingsPage() {
  const { profile, preferences, email } = await requireAccount();
  const sections = [
    {
      id: "account",
      title: "Account",
      content: <ProfileForm name={profile.display_name} email={email} />,
    },
    {
      id: "preferences",
      title: "Preferences",
      content: (
        <PreferencesForm
          theme={preferences.theme}
          timezone={preferences.timezone}
          weekStartsOn={preferences.week_starts_on}
          enabled={preferences.privacy_mode}
        />
      ),
    },
    {
      id: "data",
      title: "Your data",
      content: (
        <div className="max-w-md space-y-6">
          <ExportControl />
          <details className="rounded-lg border p-4">
            <summary className="flex min-h-11 cursor-pointer items-center text-sm text-destructive">
              Delete data or account
            </summary>
            <div className="mt-5 space-y-8">
              <section aria-labelledby="delete-data-heading">
                <h3 id="delete-data-heading" className="mb-4 font-medium">
                  Delete habit data
                </h3>
                <DeleteDataForm />
              </section>
              <section
                aria-labelledby="delete-account-heading"
                className="border-t pt-6"
              >
                <h3 id="delete-account-heading" className="mb-4 font-medium">
                  Delete account
                </h3>
                <DeleteAccountForm available={isAccountDeletionConfigured()} />
              </section>
            </div>
          </details>
        </div>
      ),
    },
  ];
  return (
    <div className="mx-auto max-w-2xl">
      <header>
        <h1 className="text-page font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Make yourself at home.
        </p>
      </header>
      {sections.map((section) => (
        <section
          key={section.id}
          aria-labelledby={`${section.id}-title`}
          className="grid gap-5 border-b py-8 sm:grid-cols-[140px_1fr]"
        >
          <h2 id={`${section.id}-title`} className="text-base font-medium">
            {section.title}
          </h2>
          {section.content}
        </section>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-5 py-8">
        <InstallControl />
        <LogoutButton />
      </div>
    </div>
  );
}
