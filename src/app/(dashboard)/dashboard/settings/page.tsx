import { getUserProfile } from "@/actions/user";
import { SettingsClient } from "@/components/dashboard/settings-client";

export default async function SettingsPage() {
  const res = await getUserProfile();
  
  if (!res.success) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Failed to load profile. Please refresh.
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Profile Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your account settings and personal details.
        </p>
      </div>

      <SettingsClient user={res.data} />
    </div>
  );
}
