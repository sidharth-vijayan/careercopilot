"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/store/toast";
import { updateUserProfile } from "@/actions/user";

interface SettingsClientProps {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const [name, setName] = useState(user.name || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const res = await updateUserProfile({ name });

    setIsSaving(false);

    if (res.success) {
      toast("Profile Updated", {
        description: "Your settings have been saved.",
        type: "success"
      });
    } else {
      toast("Error", {
        description: res.error || "Failed to update profile.",
        type: "error"
      });
    }
  };

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm shadow-sm text-muted-foreground cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Your email address is managed by your authentication provider.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John Doe"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>

        <div className="pt-4 border-t flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
