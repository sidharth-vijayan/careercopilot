"use client";

import { useState } from "react";
import {
  Loader2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Pencil,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeResumeWithAI } from "@/actions/analyze";
import { ResumeEditor } from "@/components/dashboard/resume-editor";
import { AddApplicationModal } from "@/components/dashboard/add-application-modal";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "@/lib/store/toast";
import { updateResumeText } from "@/actions/resume";
import { Skeleton } from "@/components/ui/skeleton";

interface JobAnalyzerProps {
  resumeText: string;
  resumeId: string;
  onReset: () => void;
}

export function JobAnalyzer({ resumeText: initialResumeText, resumeId, onReset }: JobAnalyzerProps) {
  const [resumeText, setResumeText] = useState(initialResumeText);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);

  const handleAnalyze = async (overrideResumeText?: string) => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description first.");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const response = await analyzeResumeWithAI(resumeId, jobDescription, overrideResumeText);
      if (response.success) {
        setResults(response.data);
        toast("Analysis Complete", {
          description: `Your ATS match score is ${response.data.matchScore}%`,
          type: "success",
        });
      } else {
        setError(response.error || "Failed to analyze");
        toast("Analysis Failed", {
          description: response.error || "Failed to analyze",
          type: "error",
        });
      }
    } catch (err) {
      setError("An unexpected error occurred");
      toast("Error", {
        description: "An unexpected error occurred during analysis.",
        type: "error",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEditorSave = async (updatedText: string) => {
    setResumeText(updatedText);
    setIsEditing(false);
    
    toast("Saving updates...", { description: "Updating your resume in the database." });
    await updateResumeText(resumeId, updatedText);
    
    handleAnalyze(updatedText);
  };

  // Resume Editor view
  if (isEditing && results) {
    return (
      <ResumeEditor
        resumeText={resumeText}
        missingSkills={results.missingSkills || []}
        matchingSkills={results.matchingSkills || []}
        onSave={handleEditorSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  // Loading state during re-analysis or initial analysis
  if (isAnalyzing) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h3 className="text-xl font-semibold text-foreground">
            {results ? "Re-analyzing your updated resume..." : "Analyzing job compatibility..."}
          </h3>
          <p className="text-muted-foreground text-sm">
            Our AI is comparing your resume against the job description...
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 rounded-xl border bg-card p-6 flex flex-col items-center justify-center">
            <Skeleton className="h-4 mb-4 w-32" />
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
          <div className="md:col-span-2 rounded-xl border bg-card p-6 flex flex-col justify-center gap-4">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results view
  if (results) {
    const pieData = [
      { name: "Match", value: results.matchScore },
      { name: "Gap", value: 100 - results.matchScore },
    ];

    const scoreColor =
      results.matchScore >= 75
        ? "text-green-500"
        : results.matchScore >= 50
          ? "text-yellow-500"
          : "text-destructive";

    return (
      <div className="w-full max-w-4xl mx-auto mt-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Button variant="ghost" onClick={() => setResults(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Editor
          </Button>
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={() => setShowTrackModal(true)}>
              <Briefcase className="mr-2 h-4 w-4" />
              Track Application
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Resume & Import Keywords
            </Button>
            <Button variant="outline" onClick={onReset}>
              Upload New Resume
            </Button>
          </div>

          <AddApplicationModal
            isOpen={showTrackModal}
            onClose={() => setShowTrackModal(false)}
            prefill={{
              jobTitle: results.jobTitle,
              matchScore: results.matchScore,
              jobDescription: jobDescription,
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 rounded-xl border bg-card p-6 flex flex-col items-center justify-center shadow-sm">
            <h3 className="text-lg font-medium text-muted-foreground mb-4">
              ATS Match Score
            </h3>
            <div className="h-48 w-48 relative">
              <ResponsiveContainer width={192} height={192}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--muted))" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className={`text-4xl font-bold ${scoreColor}`}>
                  {results.matchScore}%
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Executive Summary
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {results.summary}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              Matching Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {results.matchingSkills.map((skill: string) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600 dark:text-green-400"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <XCircle className="h-5 w-5 text-destructive mr-2" />
              Missing Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {results.missingSkills.map((skill: string) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive cursor-pointer hover:bg-destructive/20 transition-colors"
                  onClick={() => setIsEditing(true)}
                  title="Click to edit resume & add this skill"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="bg-muted/50 p-6 border-b">
            <h3 className="text-lg font-semibold text-foreground flex items-center">
              <Sparkles className="h-5 w-5 text-primary mr-2" />
              Actionable Feedback
            </h3>
          </div>
          <div className="divide-y">
            {results.actionableFeedback.map((item: any, i: number) => (
              <div
                key={i}
                className="p-6 hover:bg-muted/30 transition-colors"
              >
                <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded mb-2 uppercase tracking-wider">
                  {item.category}
                </span>
                <p className="text-foreground">{item.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Initial JD input view
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-card rounded-xl border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Paste the Job Description
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
      </div>

      <textarea
        className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y mb-4"
        placeholder="e.g. We are looking for a Senior Software Engineer with 5+ years of experience in React, Node.js..."
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={() => handleAnalyze()}
          disabled={isAnalyzing || !jobDescription.trim()}
          className="w-full sm:w-auto"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Compatibility...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Run AI Analysis
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
