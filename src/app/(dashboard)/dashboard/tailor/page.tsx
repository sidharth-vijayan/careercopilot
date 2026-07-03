"use client";

import { useState } from "react";
import { tailorVaultWithAI } from "@/actions/vault";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  FileText, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle, 
  Undo,
  Download,
  Lightbulb
} from "lucide-react";
import { toast } from "@/lib/store/toast";
import Link from "next/link";

interface TailoredResumeData {
  id: string;
  jobTitle: string;
  company: string;
  justification: string;
  experiences: Array<{
    vaultItemId: string;
    title: string;
    originalBullets: string[];
    tailoredBullets: string[];
  }>;
  projects: Array<{
    vaultItemId: string;
    title: string;
    originalBullets: string[];
    tailoredBullets: string[];
  }>;
  skills: Array<{
    category: string;
    items: string[];
  }>;
}

export default function TailorPage() {
  // Workflow step: "input" | "loading" | "review"
  const [step, setStep] = useState<"input" | "loading" | "review">("input");
  
  // Form input
  const [jobDescription, setJobDescription] = useState("");
  
  // AI tailored output
  const [tailoredData, setTailoredData] = useState<TailoredResumeData | null>(null);

  const handleTailor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      toast("Validation Error", {
        description: "Please paste a target Job Description first.",
        type: "error"
      });
      return;
    }

    setStep("loading");

    const response = await tailorVaultWithAI(jobDescription);
    if (response.success && response.data) {
      setTailoredData(response.data);
      setStep("review");
      toast("Tailored Successfully!", {
        description: "Your Vault bullet points have been optimized for this job description.",
        type: "success"
      });
    } else {
      toast("Optimization Failed", {
        description: response.error || "Failed to customize points. Check if your Vault contains experiences.",
        type: "error"
      });
      setStep("input");
    }
  };

  const handleReset = () => {
    setStep("input");
    setJobDescription("");
    setTailoredData(null);
  };

  // Prefill a real Senior Dev Job description so the user can easily test the tailoring workflow!
  const loadDemoJobDescription = () => {
    const demoJD = `Senior Software Engineer (Full Stack) | TechEnterprise

We are looking for a Senior Full Stack Software Engineer to build scalable features for our B2B Enterprise SaaS applications.

Requirements:
- 5+ years of production experience in TypeScript, React.js, and Node.js.
- Strong proficiency architecting high-throughput GraphQL APIs or REST API Gateways.
- Production experience containerizing systems with Docker and optimizing PostgreSQL database queries.
- Familiarity with DevOps workflows, including container orchestration, Redis caching, and automated CI/CD releases.
- Strong focus on performance metrics, page load speeds, and scalable web engineering.`;
    
    setJobDescription(demoJD);
    toast("Demo Job Description Loaded", {
      description: "Ready for instant AI tailoring.",
      type: "success"
    });
  };

  return (
    <div className="flex-1 space-y-8 p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
          AI Instant Tailor ⚡
        </h1>
        <p className="text-muted-foreground mt-2 text-base max-w-2xl">
          Paste any job description. Our AI will rank your experience database, select the absolute best accomplishments, and optimize their wording to match the role keywords perfectly.
        </p>
      </div>

      {/* STEP 1: Input Job Description */}
      {step === "input" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in duration-200">
          {/* Main Input Column */}
          <form onSubmit={handleTailor} className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <label className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Target Job Description
                </label>
                <Button type="button" variant="ghost" className="h-8 px-3 text-xs font-bold text-primary flex items-center gap-1 border border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10" onClick={loadDemoJobDescription}>
                  Prefill Demo Job Description
                </Button>
              </div>

              <textarea
                required
                rows={12}
                placeholder="Paste the entire text of the job description here. The more detailed, the better our AI will customize your bullet points..."
                className="w-full rounded-lg border bg-transparent p-4 text-sm outline-none focus:ring-1 focus:ring-primary leading-relaxed font-sans"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />

              <div className="flex justify-end pt-2 border-t">
                <Button type="submit" size="lg" className="h-13 px-8 text-base font-bold shadow-lg shadow-primary/20 group">
                  Optimize Bullet Points
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </form>

          {/* Right Column Help Section */}
          <div className="lg:col-span-1 rounded-xl border bg-card p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500 shrink-0" />
              How it works
            </h3>
            
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">1</span>
                <span>The AI analyzes the target job description to extract the essential keyword metrics and skill clusters.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">2</span>
                <span>It searches through your Vault experiences, selecting only the achievements that demonstrate matching competency.</span>
              </li>
              <li className="flex gap-3 text-sm text-muted-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">3</span>
                <span>It optimizes active verbs and scales keyword placement so your resume stands out instantly in ATS parsing systems.</span>
              </li>
            </ul>

            <div className="border-t pt-4 bg-primary/5 rounded-lg border border-primary/10 p-4 space-y-2 mt-2">
              <h4 className="text-xs font-extrabold uppercase text-foreground tracking-wider">ATS Compliance Notice</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Word files (.docx) offer the absolute highest indexing rate across corporate parsing algorithms like Workday and Taleo. Flat PDFs are notoriously difficult for systems to scrape properly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Loading State */}
      {step === "loading" && (
        <div className="flex flex-col items-center justify-center py-28 text-center animate-in fade-in duration-300">
          <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">AI Tailoring in Progress...</h2>
          <p className="text-muted-foreground mt-2 max-w-md text-base leading-relaxed">
            Comparing the job description keywords with your Vault database, ranking experience metrics, and writing optimized bullet achievements. This will take under 10 seconds.
          </p>
        </div>
      )}

      {/* STEP 3: Review Results */}
      {step === "review" && tailoredData && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Panel Actions */}
          <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Tailoring Strategy Completed
              </span>
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                {tailoredData.jobTitle} | {tailoredData.company}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                <strong>Justification:</strong> {tailoredData.justification}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0 self-stretch md:self-center justify-end">
              <Button variant="outline" onClick={handleReset} className="h-13 px-5 text-sm font-semibold flex items-center gap-1.5">
                <Undo className="h-4.5 w-4.5" />
                Tailor Another
              </Button>
              <a href={`/api/export/docx?id=${tailoredData.id}`} download>
                <Button size="lg" className="h-13 px-8 text-base font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download editable .docx
                </Button>
              </a>
            </div>
          </div>

          {/* Sidenote/Notice */}
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-4 flex gap-3 text-sm text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Verify your achievements. While the AI highlights relevant experiences, always double check dates, locations, and details before submitting to hiring teams.
            </p>
          </div>

          {/* Core Content Layout: Experiences & Projects */}
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold border-b pb-2 flex items-center gap-2">
              <FileText className="h-5.5 w-5.5 text-primary" />
              Tailored Professional Experience
            </h3>

            {tailoredData.experiences.map((exp, i) => (
              <div key={i} className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
                <h4 className="text-lg font-bold text-foreground border-b pb-3">{exp.title}</h4>
                
                <div className="space-y-4">
                  {exp.tailoredBullets.map((bullet, idx) => (
                    <div key={idx} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start p-4 rounded-lg bg-muted/20 border hover:bg-muted/30 transition-all">
                      {/* Left: Original */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                          Original Vault Bullet
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {exp.originalBullets[idx] || "—"}
                        </p>
                      </div>

                      {/* Right: Tailored */}
                      <div className="space-y-1.5 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
                        <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                          Tailored AI Bullet (ATS Optimized)
                        </span>
                        <p className="text-sm text-foreground leading-relaxed font-semibold">
                          {bullet}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Projects (if exists) */}
          {tailoredData.projects && tailoredData.projects.length > 0 && (
            <div className="space-y-6 pt-4">
              <h3 className="text-xl font-extrabold border-b pb-2 flex items-center gap-2">
                <FileText className="h-5.5 w-5.5 text-primary" />
                Tailored Projects
              </h3>

              {tailoredData.projects.map((proj, i) => (
                <div key={i} className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
                  <h4 className="text-lg font-bold text-foreground border-b pb-3">{proj.title}</h4>
                  
                  <div className="space-y-4">
                    {proj.tailoredBullets.map((bullet, idx) => (
                      <div key={idx} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start p-4 rounded-lg bg-muted/20 border hover:bg-muted/30 transition-all">
                        {/* Left: Original */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                            Original Vault Bullet
                          </span>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {proj.originalBullets[idx] || "—"}
                          </p>
                        </div>

                        {/* Right: Tailored */}
                        <div className="space-y-1.5 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6">
                          <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                            Tailored AI Bullet
                          </span>
                          <p className="text-sm text-foreground leading-relaxed font-semibold">
                            {bullet}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Technical Skills Tag Summary */}
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-foreground border-b pb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Tailored Technical Skills Keyword Map
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tailoredData.skills.map((skillGroup, i) => (
                <div key={i} className="space-y-3 p-4 rounded-lg bg-muted/10 border">
                  <h4 className="text-sm font-extrabold uppercase text-primary tracking-wider border-b pb-1">
                    {skillGroup.category}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((skill, idx) => (
                      <span key={idx} className="inline-flex items-center rounded-full bg-primary/10 border px-3 py-1.5 text-xs font-bold text-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Export Call To Action */}
          <div className="rounded-2xl border bg-card p-8 md:p-12 text-center shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06),transparent_70%)]" />
            <Sparkles className="h-10 w-10 text-primary mx-auto animate-pulse" />
            <h3 className="text-2xl font-extrabold tracking-tight">Your tailored resume is ready.</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              Open with Word or Google Docs, perform minor adjustments, and apply immediately with the absolute highest probability of passing ATS checks.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <Button variant="outline" className="h-12 px-6 font-semibold" onClick={handleReset}>
                Tailor Another Job
              </Button>
              <a href={`/api/export/docx?id=${tailoredData.id}`} download>
                <Button size="lg" className="h-12 px-8 font-bold shadow-lg shadow-primary/20 flex items-center gap-1.5">
                  <Download className="h-5 w-5" />
                  Download Word .docx
                </Button>
              </a>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
