"use client";

import { useState } from "react";
import { FileText, Plus, Star, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ResumeUpload } from "@/components/dashboard/resume-upload";
import { JobAnalyzer } from "@/components/dashboard/job-analyzer";
import type { ResumeSummary } from "@/actions/resumes";

interface OverviewClientProps {
  resumes: ResumeSummary[];
}

/**
 * Overview flow.
 *
 * Previously this page rendered the uploader unconditionally, so every visit
 * began by re-uploading a resume that was already stored — the single biggest
 * friction point in daily use. Saved resumes are now selectable, and uploading
 * is the fallback rather than the entry point.
 */
export function OverviewClient({ resumes }: OverviewClientProps) {
  const defaultResume = resumes.find((r) => r.isDefault) ?? resumes[0] ?? null;

  const [selected, setSelected] = useState<{ text: string; id: string } | null>(
    defaultResume ? { text: defaultResume.parsedText, id: defaultResume.id } : null
  );
  const [isUploading, setIsUploading] = useState(resumes.length === 0);

  const handleUploadSuccess = (text: string, id: string) => {
    setSelected({ text, id });
    setIsUploading(false);
  };

  if (isUploading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {resumes.length === 0 ? "Welcome — let's get started" : "Upload a resume"}
          </h2>
          <p className="text-muted-foreground">
            {resumes.length === 0
              ? "Upload your resume once. Everything else in CareerCopilot builds on it."
              : "Add another version to analyze against."}
          </p>
        </div>

        <ResumeUpload onUploadSuccess={handleUploadSuccess} />

        {resumes.length > 0 && (
          <div className="flex justify-center">
            <Button variant="ghost" onClick={() => setIsUploading(false)}>
              Cancel — use a saved resume instead
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="space-y-4">
        <ResumePicker
          resumes={resumes}
          selectedId={null}
          onSelect={(r) => setSelected({ text: r.parsedText, id: r.id })}
          onUploadNew={() => setIsUploading(true)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Analyze a job description
        </h2>
        <p className="text-muted-foreground">
          Paste a posting below to see how well your resume matches it.
        </p>
      </div>

      <ResumePicker
        resumes={resumes}
        selectedId={selected.id}
        onSelect={(r) => setSelected({ text: r.parsedText, id: r.id })}
        onUploadNew={() => setIsUploading(true)}
      />

      {/*
        `key` remounts the analyzer when the resume changes, clearing results
        from the previously selected resume instead of showing them against
        the new one.
      */}
      <JobAnalyzer
        key={selected.id}
        resumeText={selected.text}
        resumeId={selected.id}
        onReset={() => setIsUploading(true)}
      />
    </div>
  );
}

function ResumePicker({
  resumes,
  selectedId,
  onSelect,
  onUploadNew,
}: {
  resumes: ResumeSummary[];
  selectedId: string | null;
  onSelect: (resume: ResumeSummary) => void;
  onUploadNew: () => void;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          {selectedId ? "Analyzing with" : "Choose a resume"}
        </h3>
        <Button variant="ghost" size="sm" onClick={onUploadNew}>
          <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Upload new
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {resumes.map((resume) => {
          const isSelected = resume.id === selectedId;
          return (
            <button
              key={resume.id}
              type="button"
              onClick={() => onSelect(resume)}
              aria-pressed={isSelected}
              className={`flex min-w-[190px] max-w-[240px] shrink-0 items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted"
              }`}
            >
              <FileText
                className={`h-4 w-4 shrink-0 ${
                  isSelected ? "text-primary" : "text-muted-foreground"
                }`}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {resume.originalName}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {resume.analysisCount}{" "}
                  {resume.analysisCount === 1 ? "analysis" : "analyses"}
                </span>
              </span>
              {resume.isDefault && (
                <Star
                  className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
                  aria-label="Default resume"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Shown to accounts that have nothing set up yet. */
export function OnboardingChecklist({
  hasResume,
  vaultCount,
  hasAnalysis,
}: {
  hasResume: boolean;
  vaultCount: number;
  hasAnalysis: boolean;
}) {
  const steps = [
    { done: hasResume, label: "Upload your resume", href: "/dashboard" },
    {
      done: vaultCount >= 3,
      label: `Add 3+ items to your Vault (${vaultCount}/3)`,
      href: "/dashboard/vault",
    },
    { done: hasAnalysis, label: "Run your first job analysis", href: "/dashboard" },
  ];

  if (steps.every((s) => s.done)) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Upload className="h-4 w-4 text-primary" aria-hidden="true" />
        Finish setting up
      </h3>
      <ol className="space-y-2">
        {steps.map((step) => (
          <li key={step.label} className="flex items-center gap-2.5 text-sm">
            <span
              aria-hidden="true"
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                step.done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/40 text-muted-foreground"
              }`}
            >
              {step.done ? "✓" : ""}
            </span>
            <span
              className={
                step.done ? "text-muted-foreground line-through" : "text-foreground"
              }
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
