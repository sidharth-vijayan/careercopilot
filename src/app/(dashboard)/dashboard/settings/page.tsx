import { getUserProfile } from "@/actions/user";
import { SettingsClient } from "@/components/dashboard/settings-client";

export const metadata = {
  title: "Settings · Recut",
};

export default async function SettingsPage() {
  const res = await getUserProfile();

  if (!res.success || !res.data) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {res.error ?? "Failed to load your profile. Please refresh."}
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your details, usage and account.
        </p>
      </div>

      <SettingsClient user={res.data} />
    </div>
  );
}
