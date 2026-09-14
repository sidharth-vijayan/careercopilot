"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2, MessageSquare, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JdUrlImport } from "@/components/dashboard/jd-url-import";
import { toast } from "@/lib/store/toast";
import {
  deleteCoverLetter,
  generateCoverLetter,
  type SavedCoverLetter,
} from "@/actions/cover-letter";

export function CoverLetterClient({ letters }: { letters: SavedCoverLetter[] }) {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [current, setCurrent] = useState<SavedCoverLetter | null>(letters[0] ?? null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await generateCoverLetter(jobTitle, company, jobDescription);

    setIsLoading(false);

    if (res.success && res.data) {
      setCurrent(res.data);
      // Saved server-side now, so refresh pulls it into the history list and
      // updates the header's remaining-quota chip.
      router.refresh();
      toast("Cover letter ready", { type: "success" });
    } else {
      toast("Generation failed", {
        description: res.error ?? "Please try again.",
        type: "error",
      });
    }
  };

  const inputClass =
    "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form onSubmit={handleGenerate} className="space-y-4 lg:col-span-2">
        <div className="rounded-xl border bg-card p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <label htmlFor="cl-title" className="mb-1 block text-sm font-medium">
                Job title
              </label>
              <input
                id="cl-title"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="cl-company" className="mb-1 block text-sm font-medium">
                Company
              </label>
              <input
                id="cl-company"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="cl-jd" className="block text-sm font-medium">
                Job description
              </label>
              <JdUrlImport onImport={setJobDescription} />
            </div>
            <textarea
              id="cl-jd"
              required
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here…"
              className="flex min-h-[220px] w-full resize-y rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="mt-4 w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Writing…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                Generate cover letter
              </>
            )}
          </Button>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            Written from your Vault, so fill that in first for the best results.
            It is a draft: the model can overstate or invent a detail, so read it
            before you send it.
          </p>
        </div>

        {letters.length > 0 && (
          <History letters={letters} currentId={current?.id} onSelect={setCurrent} />
        )}
      </form>

      <div className="lg:col-span-3">
        {current ? (
          <LetterView letter={current} onDeleted={() => setCurrent(null)} />
        ) : (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed bg-card p-10 text-center">
            <MessageSquare
              className="mb-3 h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
            <h3 className="text-base font-semibold text-foreground">
              No cover letter yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Fill in the role on the left and Recut will draft a letter from
              your Vault experience.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function History({
  letters,
  currentId,
  onSelect,
}: {
  letters: SavedCoverLetter[];
  currentId?: string;
  onSelect: (l: SavedCoverLetter) => void;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="mb-2 text-sm font-semibold text-foreground">Saved letters</h3>
      <ul className="space-y-1">
        {letters.map((letter) => (
          <li key={letter.id}>
            <button
              type="button"
              onClick={() => onSelect(letter)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                letter.id === currentId
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className="block truncate font-medium">{letter.jobTitle}</span>
              <span className="block truncate text-xs opacity-80">
                {letter.company} · {new Date(letter.createdAt).toLocaleDateString()}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LetterView({
  letter,
  onDeleted,
}: {
  letter: SavedCoverLetter;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(letter.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Couldn't copy", {
        description: "Select the text and copy it manually.",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    const res = await deleteCoverLetter(letter.id);
    if (res.success) {
      onDeleted();
      router.refresh();
      toast("Deleted", { type: "success" });
    } else {
      toast("Couldn't delete", { description: res.error, type: "error" });
    }
  };

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {letter.jobTitle}
          </h3>
          <p className="truncate text-xs text-muted-foreground">{letter.company}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="outline" onClick={handleCopy}>
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
          <button
            type="button"
            onClick={handleDelete}
            aria-label={`Delete cover letter for ${letter.jobTitle}`}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="p-5">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {letter.content}
        </p>
      </div>
    </div>
  );
}
