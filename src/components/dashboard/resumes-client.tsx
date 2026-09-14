"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Loader2, Star, Trash2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "@/lib/store/toast";
import { deleteResume, setDefaultResume, type ResumeSummary } from "@/actions/resumes";

export function ResumesClient({ resumes }: { resumes: ResumeSummary[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (resumes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-10 text-center">
        <FileText
          className="mx-auto mb-3 h-8 w-8 text-muted-foreground"
          aria-hidden="true"
        />
        <h3 className="text-base font-semibold text-foreground">No resumes yet</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Upload a PDF or DOCX and Recut will extract the text for analysis,
          tailoring and interview prep.
        </p>
        <Link href="/dashboard" className={`mt-4 ${buttonVariants({ size: "sm" })}`}>
          Upload a resume
        </Link>
      </div>
    );
  }

  const handleSetDefault = async (id: string) => {
    setBusyId(id);
    const res = await setDefaultResume(id);
    setBusyId(null);

    if (res.success) {
      toast("Default updated", {
        description: "This resume is now used by default.",
        type: "success",
      });
      router.refresh();
    } else {
      toast("Couldn't update", { description: res.error, type: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    const res = await deleteResume(id);
    setBusyId(null);
    setConfirmId(null);

    if (res.success) {
      toast("Resume deleted", { type: "success" });
      router.refresh();
    } else {
      toast("Couldn't delete", { description: res.error, type: "error" });
    }
  };

  return (
    <ul className="space-y-3">
      {resumes.map((resume) => (
        <li key={resume.id} className="rounded-xl border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <FileText
                className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <h3 className="flex items-center gap-2 truncate text-sm font-semibold text-foreground">
                  {resume.originalName}
                  {resume.isDefault && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                      Default
                    </span>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {resume.analysisCount}{" "}
                  {resume.analysisCount === 1 ? "analysis" : "analyses"} · added{" "}
                  {new Date(resume.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {!resume.isDefault && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSetDefault(resume.id)}
                  disabled={busyId === resume.id}
                >
                  {busyId === resume.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    "Make default"
                  )}
                </Button>
              )}
              <button
                type="button"
                onClick={() => setConfirmId(resume.id)}
                aria-label={`Delete ${resume.originalName}`}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {confirmId === resume.id && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm text-destructive">
                Delete this resume and its {resume.analysisCount}{" "}
                {resume.analysisCount === 1 ? "analysis" : "analyses"}? This can&apos;t
                be undone.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(resume.id)}
                  disabled={busyId === resume.id}
                >
                  {busyId === resume.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
