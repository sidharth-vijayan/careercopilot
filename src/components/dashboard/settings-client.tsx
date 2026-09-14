"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/lib/store/toast";
import {
  deleteAccount,
  exportMyData,
  updateUserProfile,
  type UserProfile,
} from "@/actions/user";
import { logout } from "@/actions/auth";

const FIELDS = [
  {
    key: "name",
    label: "Full name",
    placeholder: "e.g. Sidharth Vijayan",
    hint: "Printed at the top of exported resumes.",
  },
  { key: "phone", label: "Phone", placeholder: "e.g. +91 98765 43210" },
  { key: "location", label: "Location", placeholder: "e.g. Bengaluru, India" },
  { key: "linkedinUrl", label: "LinkedIn", placeholder: "linkedin.com/in/you" },
  { key: "githubUrl", label: "GitHub", placeholder: "github.com/you" },
  { key: "websiteUrl", label: "Website", placeholder: "yoursite.dev" },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

export function SettingsClient({ user }: { user: UserProfile }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<FieldKey, string>>({
    name: user.name ?? "",
    phone: user.phone ?? "",
    location: user.location ?? "",
    linkedinUrl: user.linkedinUrl ?? "",
    githubUrl: user.githubUrl ?? "",
    websiteUrl: user.websiteUrl ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const inputClass =
    "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateUserProfile(values);
    setIsSaving(false);

    if (res.success) {
      toast("Profile updated", { description: "Your details are saved.", type: "success" });
      router.refresh();
    } else {
      toast("Couldn't save", { description: res.error, type: "error" });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const res = await exportMyData();
    setIsExporting(false);

    if (!res.success || !res.data) {
      toast("Export failed", { description: res.error, type: "error" });
      return;
    }

    // Build the file in the browser so the JSON never needs a server round-trip
    // or a temporary public URL.
    const blob = new Blob([res.data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `careercopilot-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteAccount();

    if (res.success) {
      // Sign out too: the session cookie is still valid for a few moments after
      // the account behind it is gone, and leaving it alive would land them on
      // a dashboard with nothing behind it.
      await logout();
    } else {
      setIsDeleting(false);
      toast("Couldn't delete account", { description: res.error, type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground">Profile</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          These details appear on the resumes you export. Blank fields are left off.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="settings-email" className="mb-1 block text-sm font-medium">
              Email address
            </label>
            <input
              id="settings-email"
              type="email"
              value={user.email}
              disabled
              className="flex h-10 w-full cursor-not-allowed rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground shadow-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Managed by your authentication provider.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <div key={field.key}>
                <label htmlFor={field.key} className="mb-1 block text-sm font-medium">
                  {field.label}
                </label>
                <input
                  id={field.key}
                  value={values[field.key]}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [field.key]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  className={inputClass}
                />
                {"hint" in field && field.hint && (
                  <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              Save changes
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground">AI usage</h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Each analysis, rewrite, cover letter or interview review uses one
          generation. The allowance resets at midnight UTC.
        </p>
        <div className="flex items-center gap-3">
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={user.quota.used}
            aria-valuemin={0}
            aria-valuemax={user.quota.limit}
            aria-label="AI generations used today"
          >
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${Math.min(100, (user.quota.used / user.quota.limit) * 100)}%`,
              }}
            />
          </div>
          <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
            {user.quota.used} / {user.quota.limit}
          </span>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground">Your data</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Download everything CareerCopilot holds about you as JSON — profile,
          resumes, Vault, analyses, applications, cover letters and interview
          sessions.
        </p>
        <Button variant="outline" onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          Export my data
        </Button>
      </section>

      <section className="rounded-xl border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground">
          Policies
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          What is collected and who processes it, including the AI providers your
          resume text is sent to.
        </p>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <li>
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
              Terms of Use
            </Link>
          </li>
          <li>
            <Link href="/cookies" className="underline underline-offset-2 hover:text-foreground">
              Cookie Policy
            </Link>
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-destructive">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          Delete account
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Permanently removes your resumes and the files behind them, your Vault,
          analyses, applications, drafts and your sign-in record. This cannot be
          undone — export your data first if you want a copy.
        </p>

        <label htmlFor="confirm-delete" className="mb-1 block text-sm font-medium">
          Type <span className="font-mono font-bold">DELETE</span> to confirm
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className={`${inputClass} max-w-[200px]`}
          />
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={confirmText !== "DELETE" || isDeleting}
          >
            {isDeleting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            Delete my account
          </Button>
        </div>
      </section>
    </div>
  );
}
