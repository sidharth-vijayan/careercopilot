"use client";

import { useState } from "react";
import { Link2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { importJobDescription } from "@/actions/jd-import";

/**
 * "Paste a link instead" control that sits above a job-description textarea.
 *
 * Deliberately understated: JS-rendered boards (LinkedIn, Workday) can't be
 * scraped from the server, so this succeeds often enough to be a convenience
 * but never becomes the primary path.
 */
export function JdUrlImport({ onImport }: { onImport: (text: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setIsLoading(true);
    setError(null);

    const res = await importJobDescription(url);

    setIsLoading(false);

    if (res.success && res.data) {
      onImport(res.data.text);
      setIsOpen(false);
      setUrl("");
    } else {
      setError(res.error ?? "Could not import from that link.");
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
        Import from a link
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
      <div className="flex flex-wrap gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            // The parent is a form; Enter here must import, not submit it.
            if (e.key === "Enter") {
              e.preventDefault();
              if (url.trim() && !isLoading) handleImport();
            }
          }}
          placeholder="https://company.com/careers/backend-engineer"
          className="h-9 min-w-[200px] flex-1 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button
          type="button"
          size="sm"
          onClick={handleImport}
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            "Import"
          )}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsOpen(false);
            setError(null);
          }}
        >
          Cancel
        </Button>
      </div>

      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Works on most company career pages. LinkedIn and Workday render
          postings in the browser, so those need copy-paste.
        </p>
      )}
    </div>
  );
}
