"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Globe,
  Layers,
  Lock,
  Trash2,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "@/lib/store/toast";
import {
  deleteTailoredResume,
  setTailoredResumeShared,
  type TailoredDraft,
} from "@/actions/tailored";

export function TailoredClient({ drafts }: { drafts: TailoredDraft[] }) {
  if (drafts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-10 text-center">
        <Layers className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <h3 className="text-base font-semibold text-foreground">
          No tailored resumes yet
        </h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Instant Tailor picks the most relevant items from your Vault for a
          specific job and rewrites them. Drafts you generate are saved here.
        </p>
        <Link
          href="/dashboard/tailor"
          className={`mt-4 ${buttonVariants({ size: "sm" })}`}
        >
          Tailor a resume
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {drafts.map((draft) => (
        <DraftCard key={draft.id} draft={draft} />
      ))}
    </ul>
  );
}

function DraftCard({ draft }: { draft: TailoredDraft }) {
  const router = useRouter();
  const [shareId, setShareId] = useState(draft.shareId);
  const [isBusy, setIsBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  const bulletCount =
    (draft.data?.experiences.length ?? 0) + (draft.data?.projects.length ?? 0);

  const handleDelete = async () => {
    setIsBusy(true);
    const res = await deleteTailoredResume(draft.id);
    setIsBusy(false);

    if (res.success) {
      toast("Draft deleted", { type: "success" });
      router.refresh();
    } else {
      toast("Couldn't delete", { description: res.error, type: "error" });
    }
  };

  const handleToggleShare = async () => {
    setIsBusy(true);
    const res = await setTailoredResumeShared(draft.id, !shareId);
    setIsBusy(false);

    if (res.success && res.data) {
      setShareId(res.data.shareId);
      toast(res.data.shareId ? "Public link created" : "Link revoked", {
        description: res.data.shareId
          ? "Anyone with the link can view this resume."
          : "The old link no longer works.",
        type: "success",
      });
      router.refresh();
    } else {
      toast("Couldn't update sharing", { description: res.error, type: "error" });
    }
  };

  const shareUrl =
    shareId && typeof window !== "undefined"
      ? `${window.location.origin}/r/${shareId}`
      : null;

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Couldn't copy", {
        description: "Copy the link from the address bar instead.",
        type: "error",
      });
    }
  };

  return (
    <li className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {draft.jobTitle}
          </h3>
          <p className="text-xs text-muted-foreground">
            {draft.company} · {bulletCount} sections ·{" "}
            {new Date(draft.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <a
            href={`/api/export?id=${draft.id}&format=pdf`}
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            PDF
          </a>
          <a
            href={`/api/export?id=${draft.id}&format=docx`}
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            DOCX
          </a>
          <Button
            size="sm"
            variant={shareId ? "secondary" : "outline"}
            onClick={handleToggleShare}
            disabled={isBusy}
          >
            {shareId ? (
              <>
                <Globe className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Public
              </>
            ) : (
              <>
                <Lock className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Private
              </>
            )}
          </Button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isBusy}
            aria-label={`Delete tailored resume for ${draft.jobTitle}`}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {shareUrl && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 p-2">
          <code className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {shareUrl}
          </code>
          <Button size="sm" variant="ghost" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                Copy
              </>
            )}
          </Button>
        </div>
      )}

      {draft.data?.justification && (
        <p className="mt-3 text-sm text-muted-foreground">
          {draft.data.justification}
        </p>
      )}

      {draft.data && (
        <>
          <button
            type="button"
            onClick={() => setShowDiff((v) => !v)}
            aria-expanded={showDiff}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${showDiff ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
            {showDiff ? "Hide" : "Show"} what changed
          </button>

          {showDiff && <DiffView data={draft.data} />}
        </>
      )}
    </li>
  );
}

/**
 * Side-by-side original vs tailored bullets.
 *
 * Both versions are already stored on the draft, so this needs no extra AI
 * call — and seeing the rewrite next to the original is how you learn to write
 * the next one yourself.
 */
function DiffView({ data }: { data: NonNullable<TailoredDraft["data"]> }) {
  const entries = [...data.experiences, ...data.projects].filter(
    (entry) => entry.originalBullets.length > 0 || entry.tailoredBullets.length > 0
  );

  if (entries.length === 0) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        No bullet-level changes were recorded for this draft.
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-4 border-t pt-4">
      {entries.map((entry, i) => (
        <div key={`${entry.title}-${i}`}>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {entry.title}
          </h4>

          <div className="space-y-2">
            {entry.tailoredBullets.map((tailored, j) => {
              const original = entry.originalBullets[j];
              return (
                <div
                  key={j}
                  className="grid gap-2 rounded-lg bg-muted/40 p-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center"
                >
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {original ?? <em>Newly written for this role</em>}
                  </p>
                  <ArrowRight
                    className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block"
                    aria-hidden="true"
                  />
                  <p className="text-xs font-medium leading-relaxed text-foreground">
                    {tailored}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
