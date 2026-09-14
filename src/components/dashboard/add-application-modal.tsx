"use client";

import { useEffect, useState } from "react";
import { Briefcase, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApplicationStatus } from "@/types";
import { toast } from "@/lib/store/toast";
import { createApplication, updateApplicationDetails } from "@/actions/application";
import { Application } from "@/types";

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefill?: {
    jobTitle?: string;
    matchScore?: number;
    jobDescription?: string;
  };
  editData?: Application;
  onSuccess?: () => void;
}

const statusOptions: { value: ApplicationStatus; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "saved", label: "Saved / Bookmarked" },
];

export function AddApplicationModal({
  isOpen,
  onClose,
  prefill,
  editData,
  onSuccess,
}: AddApplicationModalProps) {
  // Callers mount this only while it is open, so each open is a fresh mount and
  // the initial state can be read straight from props. Seeding it from an
  // effect instead meant an extra render pass every time the modal appeared.
  const [company, setCompany] = useState(editData?.company ?? "");
  const [jobTitle, setJobTitle] = useState(
    editData?.jobTitle ?? prefill?.jobTitle ?? ""
  );
  const [status, setStatus] = useState<ApplicationStatus>(
    editData?.status ?? "applied"
  );
  const [appliedDate, setAppliedDate] = useState(
    (editData?.appliedAt ?? new Date().toISOString()).substring(0, 10)
  );
  const [notes, setNotes] = useState(editData?.notes ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Escape closes the dialog, matching the mobile drawer. Without it the only
  // way out with a keyboard was to tab all the way to Cancel.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !jobTitle.trim()) return;

    setIsSubmitting(true);

    let res;
    if (editData) {
      res = await updateApplicationDetails(editData.id, {
        jobTitle: jobTitle.trim(),
        company: company.trim(),
        status,
        appliedAt: new Date(appliedDate).toISOString(),
        notes: notes.trim() || undefined,
      });
    } else {
      res = await createApplication({
        jobTitle: jobTitle.trim(),
        company: company.trim(),
        status,
        matchScore: prefill?.matchScore,
        appliedAt: new Date(appliedDate).toISOString(),
        notes: notes.trim() || undefined,
        jobDescription: prefill?.jobDescription,
      });
    }

    setIsSubmitting(false);

    if (res.success) {
      toast(editData ? "Application Updated" : "Application Tracked", {
        description: editData ? `Updated details for ${company.trim()}.` : `Added ${company.trim()} to your application tracker.`,
        type: "success",
      });
      if (onSuccess) onSuccess();
      onClose();
    } else {
      toast(editData ? "Failed to update application" : "Failed to track application", {
        description: res.error,
        type: "error",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-modal-title"
        className="relative w-full max-w-lg mx-4 rounded-xl border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h3
            id="application-modal-title"
            className="text-lg font-semibold text-foreground flex items-center gap-2"
          >
            <Briefcase className="h-5 w-5 text-primary" aria-hidden="true" />
            {editData ? "Edit Application" : "Track Application"}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <span className="sr-only">Close dialog</span>
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job Title — auto-filled */}
          <div>
            <label htmlFor="app-job-title" className="text-sm font-medium text-foreground mb-1.5 block">
              Job Title
              {prefill?.jobTitle && (
                <span className="ml-2 text-xs text-primary font-normal">
                  (auto-detected)
                </span>
              )}
            </label>
            <input
              id="app-job-title"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Software Engineering Intern"
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>

          {/* Company Name */}
          <div>
            <label htmlFor="app-company" className="text-sm font-medium text-foreground mb-1.5 block">
              Company Name
            </label>
            <input
              id="app-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google, Critical Start"
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              autoFocus
              required
            />
          </div>

          {/* Status */}
          <div>
            <span className="text-sm font-medium text-foreground mb-1.5 block" id="app-status-label">
              Status
            </span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="app-status-label">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={status === opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    status === opt.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ATS Score — read only if present */}
          {prefill?.matchScore !== undefined && (
            <div>
              <span className="text-sm font-medium text-foreground mb-1.5 block">
                Match score
              </span>
              <div className="flex items-center gap-2">
                <div
                  className="h-2 flex-1 rounded-full bg-muted overflow-hidden"
                  role="img"
                  aria-label={`Match score ${prefill.matchScore} percent`}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${prefill.matchScore}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-foreground w-10 text-right">
                  {prefill.matchScore}%
                </span>
              </div>
            </div>
          )}

          {/* Applied Date */}
          <div>
            <label htmlFor="app-applied-date" className="text-sm font-medium text-foreground mb-1.5 block">
              Applied Date
            </label>
            <input
              id="app-applied-date"
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="app-notes" className="text-sm font-medium text-foreground mb-1.5 block">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              id="app-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this application..."
              rows={2}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!company.trim() || !jobTitle.trim() || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              {editData ? "Update Application" : "Add to Tracker"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
