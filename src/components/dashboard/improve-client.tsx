"use client";

import { useState } from "react";
import {
  Loader2,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  ClipboardCopy,
  Save,
  Wand2,
  ChevronDown,
  ArrowRight,
  Shield,
  Target,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getResumeFeedback,
  rewriteBulletPoint,
  type ResumeFeedbackResult,
  type RewriteOption,
} from "@/actions/improve";
import { saveVaultItem } from "@/actions/vault";
import { toast } from "@/lib/store/toast";

interface Resume {
  id: string;
  originalName: string;
  createdAt: string;
}

interface ImproveClientProps {
  initialResumes: Resume[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function ImproveClient({ initialResumes }: ImproveClientProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<ResumeFeedbackResult | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Bullet rewriter state
  const [bulletInput, setBulletInput] = useState("");
  const [bulletContext, setBulletContext] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteResults, setRewriteResults] = useState<RewriteOption[] | null>(null);

  // Save to vault state
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [vaultTitle, setVaultTitle] = useState("");
  const [showVaultDialog, setShowVaultDialog] = useState<number | null>(null);

  const selectedResume = initialResumes.find((r) => r.id === selectedResumeId);

  const handleAnalyze = async () => {
    if (!selectedResumeId) return;
    setIsAnalyzing(true);
    setFeedback(null);

    try {
      const res = await getResumeFeedback(selectedResumeId);
      if (res.success && res.data) {
        setFeedback(res.data);
        toast("Analysis Complete", {
          description: `Your resume scored ${res.data.overallScore}/100`,
          type: "success",
        });
      } else {
        toast("Analysis Failed", {
          description: res.error || "Something went wrong.",
          type: "error",
        });
      }
    } catch {
      toast("Error", {
        description: "An unexpected error occurred.",
        type: "error",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRewrite = async () => {
    if (!bulletInput.trim()) return;
    setIsRewriting(true);
    setRewriteResults(null);

    try {
      const res = await rewriteBulletPoint(bulletInput.trim(), bulletContext.trim() || undefined);
      if (res.success && res.data) {
        setRewriteResults(res.data);
        toast("Rewrites Generated", {
          description: "4 alternative versions ready for review.",
          type: "success",
        });
      } else {
        toast("Rewrite Failed", {
          description: res.error || "Something went wrong.",
          type: "error",
        });
      }
    } catch {
      toast("Error", {
        description: "An unexpected error occurred.",
        type: "error",
      });
    } finally {
      setIsRewriting(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast("Copied!", { description: "Bullet point copied to clipboard.", type: "success" });
  };

  const handleSaveToVault = async (rewrite: string, index: number) => {
    if (!vaultTitle.trim()) {
      toast("Title Required", {
        description: "Please enter a title for the Vault item.",
        type: "error",
      });
      return;
    }
    setSavingIndex(index);
    try {
      const res = await saveVaultItem(undefined, "experience", vaultTitle.trim(), [rewrite]);
      if (res.success) {
        toast("Saved to Vault!", {
          description: `"${vaultTitle}" added to your Vault.`,
          type: "success",
        });
        setShowVaultDialog(null);
        setVaultTitle("");
      } else {
        toast("Save Failed", {
          description: res.error || "Could not save to Vault.",
          type: "error",
        });
      }
    } catch {
      toast("Error", { description: "An unexpected error occurred.", type: "error" });
    } finally {
      setSavingIndex(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Empty state
  // ─────────────────────────────────────────────────────────────────────────

  if (initialResumes.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No resumes uploaded yet
        </h3>
        <p className="text-muted-foreground text-sm">
          Upload a resume from the{" "}
          <a href="/dashboard" className="text-primary hover:underline">
            Overview
          </a>{" "}
          page first, then come back here for AI suggestions.
        </p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Score badge helper
  // ─────────────────────────────────────────────────────────────────────────

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-destructive";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "from-green-500/20 to-green-500/5";
    if (score >= 60) return "from-yellow-500/20 to-yellow-500/5";
    return "from-destructive/20 to-destructive/5";
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-blue-400 flex-shrink-0" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      high: "bg-destructive/10 text-destructive",
      medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
      low: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    };
    return colors[severity] || colors.low;
  };

  const rewriteIcons = [
    <TrendingUp key="q" className="h-4 w-4" />,
    <Zap key="a" className="h-4 w-4" />,
    <Target key="c" className="h-4 w-4" />,
    <Shield key="t" className="h-4 w-4" />,
  ];

  // ─────────────────────────────────────────────────────────────────────────
  // Loading skeleton
  // ─────────────────────────────────────────────────────────────────────────

  if (isAnalyzing) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <Loader2 className="h-10 w-10 animate-spin text-primary relative" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Analyzing your resume...
          </h3>
          <p className="text-muted-foreground text-sm">
            Our AI is evaluating structure, impact, formatting, and ATS compatibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-card p-6 flex flex-col items-center justify-center">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-4 w-24 mt-4" />
          </div>
          <div className="md:col-span-2 rounded-xl border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
              <Skeleton className="h-5 w-32" />
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Feedback results
  // ─────────────────────────────────────────────────────────────────────────

  if (feedback) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Score + Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-card p-6 flex flex-col items-center justify-center shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
              Overall Score
            </h3>
            <div
              className={`relative h-32 w-32 rounded-full bg-gradient-to-b ${getScoreBg(
                feedback.overallScore
              )} flex items-center justify-center`}
            >
              <div className="absolute inset-2 rounded-full bg-card flex items-center justify-center">
                <span className={`text-4xl font-bold ${getScoreColor(feedback.overallScore)}`}>
                  {feedback.overallScore}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">out of 100</p>
          </div>

          <div className="md:col-span-2 rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Executive Summary
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              {feedback.summary}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFeedback(null);
                  setSelectedResumeId("");
                }}
              >
                ← Analyze Another
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFeedback(null)}
              >
                Re-run Analysis
              </Button>
            </div>
          </div>
        </div>

        {/* Strengths */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            Strengths
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {feedback.strengths.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg bg-green-500/5 border border-green-500/10 p-3"
              >
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warnings */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="bg-muted/50 p-6 border-b">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              Issues &amp; Suggestions
            </h3>
          </div>
          <div className="divide-y">
            {feedback.warnings.map((w, i) => (
              <div key={i} className="p-5 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  {getSeverityIcon(w.severity)}
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider ${getSeverityBadge(
                      w.severity
                    )}`}
                  >
                    {w.severity}
                  </span>
                  <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded uppercase tracking-wider">
                    {w.category}
                  </span>
                </div>
                <p className="text-foreground text-sm font-medium mb-1">{w.message}</p>
                <p className="text-muted-foreground text-sm">{w.suggestion}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Formatting Checks */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Shield className="h-5 w-5 text-primary mr-2" />
            Formatting &amp; Structure Checks
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {feedback.formattingChecks.map((check, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-lg p-3 border ${
                  check.passed
                    ? "border-green-500/10 bg-green-500/5"
                    : "border-destructive/10 bg-destructive/5"
                }`}
              >
                {check.passed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{check.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bullet Critiques */}
        {feedback.bulletCritiques && feedback.bulletCritiques.length > 0 && (
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="bg-muted/50 p-6 border-b">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <Sparkles className="h-5 w-5 text-primary mr-2" />
                Weak Bullet Points — AI Improved
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                These bullet points were identified as the weakest and rewritten by AI.
              </p>
            </div>
            <div className="divide-y">
              {feedback.bulletCritiques.map((critique, i) => (
                <div key={i} className="p-5 space-y-3">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      Original
                    </span>
                    <p className="text-sm text-foreground/70 line-through mt-1">
                      {critique.originalBullet}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 uppercase tracking-wider font-medium">
                      Issue
                    </span>
                  </div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    {critique.issue}
                  </p>
                  <div>
                    <span className="text-xs text-green-600 dark:text-green-400 uppercase tracking-wider font-medium">
                      Improved
                    </span>
                    <p className="text-sm text-foreground font-medium mt-1">
                      {critique.improvedVersion}
                    </p>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(critique.improvedVersion)}
                    >
                      <ClipboardCopy className="h-3.5 w-3.5 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBulletInput(critique.originalBullet)}
                    >
                      <Wand2 className="h-3.5 w-3.5 mr-1" />
                      Open in Rewriter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bullet Point Rewriter Section */}
        <BulletRewriterSection
          bulletInput={bulletInput}
          setBulletInput={setBulletInput}
          bulletContext={bulletContext}
          setBulletContext={setBulletContext}
          isRewriting={isRewriting}
          handleRewrite={handleRewrite}
          rewriteResults={rewriteResults}
          rewriteIcons={rewriteIcons}
          handleCopy={handleCopy}
          showVaultDialog={showVaultDialog}
          setShowVaultDialog={setShowVaultDialog}
          vaultTitle={vaultTitle}
          setVaultTitle={setVaultTitle}
          handleSaveToVault={handleSaveToVault}
          savingIndex={savingIndex}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Initial selection view
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Resume selector + analyze */}
      <div className="max-w-2xl mx-auto rounded-xl border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Select a Resume</h3>
            <p className="text-sm text-muted-foreground">
              Choose which resume to analyze for improvement suggestions.
            </p>
          </div>
        </div>

        {/* Custom dropdown */}
        <div className="relative mb-6">
          <button
            type="button"
            className="flex items-center justify-between w-full rounded-lg border border-input bg-transparent px-4 py-3 text-sm text-foreground hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className={selectedResume ? "text-foreground" : "text-muted-foreground"}>
              {selectedResume ? selectedResume.originalName : "Choose a resume..."}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border bg-popover shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              {initialResumes.map((resume) => (
                <button
                  key={resume.id}
                  type="button"
                  className={`flex items-center gap-3 w-full px-4 py-3 text-left text-sm hover:bg-muted/50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    selectedResumeId === resume.id
                      ? "bg-primary/5 text-primary"
                      : "text-foreground"
                  }`}
                  onClick={() => {
                    setSelectedResumeId(resume.id);
                    setDropdownOpen(false);
                  }}
                >
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{resume.originalName}</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded{" "}
                      {new Date(resume.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {selectedResumeId === resume.id && (
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={handleAnalyze}
          disabled={!selectedResumeId || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Get AI Feedback
            </>
          )}
        </Button>
      </div>

      {/* Bullet Point Rewriter — always available */}
      <BulletRewriterSection
        bulletInput={bulletInput}
        setBulletInput={setBulletInput}
        bulletContext={bulletContext}
        setBulletContext={setBulletContext}
        isRewriting={isRewriting}
        handleRewrite={handleRewrite}
        rewriteResults={rewriteResults}
        rewriteIcons={rewriteIcons}
        handleCopy={handleCopy}
        showVaultDialog={showVaultDialog}
        setShowVaultDialog={setShowVaultDialog}
        vaultTitle={vaultTitle}
        setVaultTitle={setVaultTitle}
        handleSaveToVault={handleSaveToVault}
        savingIndex={savingIndex}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bullet Rewriter Section (extracted for reuse)
// ─────────────────────────────────────────────────────────────────────────────

function BulletRewriterSection({
  bulletInput,
  setBulletInput,
  bulletContext,
  setBulletContext,
  isRewriting,
  handleRewrite,
  rewriteResults,
  rewriteIcons,
  handleCopy,
  showVaultDialog,
  setShowVaultDialog,
  vaultTitle,
  setVaultTitle,
  handleSaveToVault,
  savingIndex,
}: {
  bulletInput: string;
  setBulletInput: (v: string) => void;
  bulletContext: string;
  setBulletContext: (v: string) => void;
  isRewriting: boolean;
  handleRewrite: () => void;
  rewriteResults: RewriteOption[] | null;
  rewriteIcons: React.ReactNode[];
  handleCopy: (text: string) => void;
  showVaultDialog: number | null;
  setShowVaultDialog: (v: number | null) => void;
  vaultTitle: string;
  setVaultTitle: (v: string) => void;
  handleSaveToVault: (text: string, idx: number) => void;
  savingIndex: number | null;
}) {
  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b">
        <h3 className="text-lg font-semibold text-foreground flex items-center">
          <Wand2 className="h-5 w-5 text-primary mr-2" />
          Bullet Point Rewriter
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          Paste any bullet point and get 4 AI-generated alternatives in different styles.
        </p>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Your Bullet Point
          </label>
          <textarea
            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            placeholder="e.g. Worked on building the frontend of the company website using React..."
            value={bulletInput}
            onChange={(e) => setBulletInput(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Context{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            type="text"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="e.g. Software Engineer at Google, building internal tools"
            value={bulletContext}
            onChange={(e) => setBulletContext(e.target.value)}
          />
        </div>

        <Button
          onClick={handleRewrite}
          disabled={isRewriting || !bulletInput.trim()}
          className="w-full sm:w-auto"
        >
          {isRewriting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Rewriting...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Rewrite with AI
            </>
          )}
        </Button>

        {/* Results */}
        {rewriteResults && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {rewriteResults.map((option, i) => (
              <div
                key={i}
                className="rounded-lg border bg-muted/30 p-4 space-y-3 hover:bg-muted/50 transition-colors group relative"
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                    {rewriteIcons[i]}
                  </div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {option.label}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{option.rewrite}</p>

                {/* Inline vault save dialog */}
                {showVaultDialog === i && (
                  <div className="rounded-lg border bg-card p-3 space-y-2 animate-in fade-in duration-200">
                    <label className="text-xs font-medium text-foreground">
                      Vault Item Title
                    </label>
                    <input
                      type="text"
                      className="flex h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="e.g. SWE at Google — Frontend"
                      value={vaultTitle}
                      onChange={(e) => setVaultTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveToVault(option.rewrite, i);
                      }}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveToVault(option.rewrite, i)}
                        disabled={savingIndex === i}
                      >
                        {savingIndex === i ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <Save className="h-3 w-3 mr-1" />
                        )}
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowVaultDialog(null);
                          setVaultTitle("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(option.rewrite)}
                  >
                    <ClipboardCopy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowVaultDialog(showVaultDialog === i ? null : i);
                      setVaultTitle("");
                    }}
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Save to Vault
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
