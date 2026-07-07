"use client";

import { useState } from "react";
import { PenTool, Loader2, Copy, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCoverLetter } from "@/actions/cover-letter";
import { toast } from "@/lib/store/toast";

export function CoverLetterClient() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    if (!jobTitle.trim() || !company.trim() || !jobDescription.trim()) {
      toast("Missing fields", {
        description: "Please fill out the job title, company, and job description.",
        type: "error",
      });
      return;
    }

    setIsGenerating(true);
    const res = await generateCoverLetter(jobTitle.trim(), company.trim(), jobDescription.trim());
    setIsGenerating(false);

    if (res.success && res.data) {
      setCoverLetter(res.data);
      toast("Success", {
        description: "Your custom cover letter has been generated!",
        type: "success",
      });
    } else {
      toast("Generation Failed", {
        description: res.error || "Something went wrong.",
        type: "error",
      });
    }
  };

  const handleCopy = async () => {
    if (!coverLetter) return;
    try {
      await navigator.clipboard.writeText(coverLetter);
      setIsCopied(true);
      toast("Copied!", { description: "Cover letter copied to clipboard.", type: "success" });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast("Copy Failed", { description: "Could not copy to clipboard.", type: "error" });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <PenTool className="h-6 w-6 text-primary" />
          Cover Letter Generator
        </h2>
        <p className="text-muted-foreground mt-1">
          Generate a highly-tailored cover letter based on your Vault experience and the job description.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Input Form */}
        <div className="space-y-6 bg-card border rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              className="flex min-h-[250px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
            />
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating || !jobTitle || !company || !jobDescription}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Writing your letter...
              </>
            ) : (
              <>
                Generate Cover Letter
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>

        {/* Right Col: Output */}
        <div className="bg-muted/30 border rounded-xl p-6 relative flex flex-col h-[500px] lg:h-auto">
          {coverLetter ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-foreground">Your Tailored Letter</h3>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {isCopied ? (
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  {isCopied ? "Copied" : "Copy to Clipboard"}
                </Button>
              </div>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full flex-1 bg-transparent border-0 focus:ring-0 resize-none text-foreground leading-relaxed"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center opacity-50">
              <PenTool className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No letter generated yet</p>
              <p className="text-sm max-w-xs mt-2">
                Fill out the details on the left and hit generate. We'll use your Vault experience to write the perfect letter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
