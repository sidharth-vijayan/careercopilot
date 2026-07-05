"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { BrandIcon } from "@/components/brand-icon";

export default function SampleReportPage() {
  const [activeTab, setActiveTab] = useState<"analysis" | "resume">("analysis");

  // Sample Resume Text used for mock report
  const sampleResumeText = `SIDHARTH VIJAYAN
sidharth@example.com | Singapore | linkedin.com/in/sidharthv

PROFESSIONAL SUMMARY
Senior Software Engineer with 6+ years of experience building high-performance, scalable web applications. Expert in TypeScript, React, and Node.js with strong cloud computing skills (AWS) and modern containerization practices. Passionate about system performance, developer experience, and product excellence.

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript (ES6+), SQL, HTML5, CSS3
- Frontend: React.js, Redux Toolkit, TailwindCSS, GraphQL (Apollo), Webpack
- Backend: Node.js, Express.js, GraphQL, PostgreSQL, MongoDB, RESTful APIs
- DevOps & Cloud: AWS (S3, EC2, CloudFront, Lambda), Docker, Git, Linux

PROFESSIONAL EXPERIENCE
Senior Full Stack Engineer | TechCorp Solutions
Jan 2022 - Present
- Led a team of 4 engineers to rebuild a legacy analytics dashboard in React & TypeScript, resulting in a 40% reduction in page load time and a 25% increase in user engagement.
- Architected and built a high-throughput GraphQL API gateway using Node.js and Express, consolidating 15+ microservices and serving 5M+ daily requests.
- Spearheaded migration of on-premise infrastructure to AWS utilizing Docker containerization, which enhanced service reliability to 99.95%.
- Implemented robust database optimization strategies for PostgreSQL, reducing slow query execution by 35% through proper indexing and caching.

Full Stack Developer | InnovateLabs
Mar 2020 - Dec 2021
- Developed interactive user interfaces using React, Redux, and TailwindCSS for a highly secure B2B SaaS platform.
- Designed and built scalable backend REST APIs using Node.js and Express, supporting over 100k monthly active users.
- Maintained CI/CD pipelines and automated deployments to AWS EC2 instances, reducing release cycles by 20%.
- Conducted regular code reviews and introduced unit testing guidelines, boosting overall code coverage to 80%.`;

  // Sample target job description
  const sampleJobDescription = `We are looking for a Senior Full Stack Engineer to join our core product team. You will be responsible for building next-generation features for our enterprise B2B SaaS platform.

Requirements:
- 5+ years of software engineering experience.
- Expert-level knowledge of TypeScript, React, and Node.js.
- Strong hands-on experience with Next.js (App Router, Server Components) and TailwindCSS.
- Experience with database systems like PostgreSQL and caching solutions like Redis.
- Solid understanding of DevOps, Docker, and container orchestration using Kubernetes.
- Experience setting up robust CI/CD pipelines (GitHub Actions, etc.) and unit testing frameworks.`;

  return (
    <div className="flex min-h-screen flex-col bg-background antialiased font-sans">
      {/* Sticky Premium Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <BrandIcon />
              <span className="font-bold text-xl tracking-tight text-foreground">
                CareerCopilot
              </span>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Demo
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/">
              <Button variant="ghost" className="hidden sm:flex text-sm">
                Home
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="shadow-md bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 transition-all duration-300">
                Sign Up Free
                <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20">
        {/* Top Banner Alert */}
        <div className="bg-primary/5 border-b border-primary/10 py-3 text-center text-sm font-medium text-primary flex items-center justify-center gap-2 px-4">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>Interactive Product Tour: Reviewing a prefilled sample resume analysis.</span>
        </div>

        <div className="container mx-auto px-4 md:px-8 pt-10">
          {/* Back to Home & Title */}
          <div className="max-w-5xl mx-auto mb-10">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Sample Compatibility Report
                </h1>
                <p className="text-muted-foreground mt-2 text-base max-w-2xl">
                  Analyze your resume against any job description to discover instant ATS score improvements, target keywords, and actionable AI recommendations.
                </p>
              </div>
              <Link href="/signup">
                <Button size="lg" className="h-12 px-6 font-semibold group shadow-lg shadow-primary/10">
                  Analyze Your Resume
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Report View */}
          <div className="max-w-5xl mx-auto">
            {/* Tabs & Details Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-6 gap-4">
              <div className="flex space-x-1 bg-muted p-1 rounded-lg self-start">
                <button
                  onClick={() => setActiveTab("analysis")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === "analysis"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  AI Compatibility Analysis
                </button>
                <button
                  onClick={() => setActiveTab("resume")}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === "resume"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Raw Inputs (Demo)
                </button>
              </div>

              <div className="text-xs text-muted-foreground bg-card border px-3 py-1.5 rounded-md flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                Target: Senior Full Stack Engineer (B2B SaaS)
              </div>
            </div>

            {/* TAB CONTENT: Analysis Results */}
            {activeTab === "analysis" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                
                {/* Score & Summary Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Circular Match Score Card */}
                  <div className="lg:col-span-1 rounded-xl border bg-card p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/5 rounded-full blur-xl transition-all duration-500 group-hover:scale-125" />
                    
                    <h3 className="text-base font-semibold text-muted-foreground mb-4 tracking-wide uppercase">
                      ATS Match Score
                    </h3>
                    
                    <div className="h-44 w-44 relative flex items-center justify-center">
                      {/* Beautiful Circular Progress SVG */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {/* Background track circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="hsl(var(--muted))"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        {/* Interactive foreground score circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="hsl(var(--primary))"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={251.2}
                          strokeDashoffset={251.2 * (1 - 0.82)}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      {/* Center Score Text */}
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-5xl font-extrabold text-foreground tracking-tight">
                          82%
                        </span>
                        <span className="text-xs font-semibold text-green-500 mt-1 flex items-center gap-0.5">
                          <TrendingUp className="h-3 w-3" />
                          Good Match
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Standard industry benchmark is 75% for HR pre-screening.
                    </p>
                  </div>

                  {/* Executive Summary Card */}
                  <div className="lg:col-span-2 rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                        Executive Summary
                      </h3>
                      <p className="text-muted-foreground text-base leading-relaxed">
                        Sidharth demonstrates exceptional alignment with core full stack competencies, including comprehensive experience in <strong>TypeScript</strong>, <strong>React</strong>, and <strong>Node.js</strong>. Cloud architecture and infrastructure containerization (Docker) are solid. 
                      </p>
                      <p className="text-muted-foreground text-base leading-relaxed mt-3">
                        However, the target description emphasizes <strong>Next.js (App Router & Server Components)</strong> and <strong>Kubernetes</strong> container orchestration. Integrating references to these technologies, or expanding on caching concepts (Redis), will highly elevate ATS parsing and match viability.
                      </p>
                    </div>
                    <div className="border-t pt-4 mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Analyzed by CareerCopilot AI Engine</span>
                      <span className="font-semibold text-primary">High Accuracy Mode</span>
                    </div>
                  </div>
                </div>

                {/* Skills Keyword Alignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Matching Skills */}
                  <div className="rounded-xl border bg-card p-6 shadow-sm border-t-4 border-t-green-500/80">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center justify-between">
                      <span className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        Matching Skills ({10})
                      </span>
                      <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">
                        ATS Passed
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "TypeScript", "React.js", "Node.js", "GraphQL", 
                        "AWS", "Docker", "PostgreSQL", "TailwindCSS", 
                        "SQL", "Redux"
                      ].map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-600 dark:text-green-400 border border-green-500/10"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="rounded-xl border bg-card p-6 shadow-sm border-t-4 border-t-destructive/80">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center justify-between">
                      <span className="flex items-center">
                        <XCircle className="h-5 w-5 text-destructive mr-2 shrink-0" />
                        Missing Skills ({5})
                      </span>
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-semibold">
                        Gaps Found
                      </span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Next.js", "Kubernetes", "Redis", 
                        "CI/CD (GitHub Actions)", "Unit Testing"
                      ].map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive border border-destructive/10 cursor-pointer hover:bg-destructive/20 transition-all duration-200"
                          title="Clicking this in dashboard automatically imports keywords for editing"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Actionable Feedback */}
                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                  <div className="bg-muted/40 p-6 border-b flex items-center justify-between">
                    <h3 className="text-lg font-bold text-foreground flex items-center">
                      <Lightbulb className="h-5 w-5 text-amber-500 mr-2 shrink-0" />
                      Actionable Optimization Steps
                    </h3>
                    <span className="text-xs text-muted-foreground hidden sm:inline-block">
                      Prioritized by impact score
                    </span>
                  </div>
                  <div className="divide-y">
                    {[
                      {
                        category: "SKILLS DEPLOYMENT",
                        impact: "HIGH",
                        suggestion: "Incorporate 'Next.js' in professional experience descriptions, specifically emphasizing familiarity with the App Router or Server Components, as this is a heavily weighted criteria."
                      },
                      {
                        category: "SYSTEM INFRASTRUCTURE",
                        impact: "MEDIUM",
                        suggestion: "Address the Kubernetes keyword. If you have any foundational familiarity, specify it under your technical skills. Alternatively, compare container tools explicitly in the resume description."
                      },
                      {
                        category: "IMPACT QUANTIFICATION",
                        impact: "MEDIUM",
                        suggestion: "Great usage of metrics, but expand on business outcomes. Consider explicitly linking database indexing in PostgreSQL to actual user response speed or api responsiveness percentages."
                      }
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="p-6 hover:bg-muted/20 transition-colors duration-200 flex flex-col sm:flex-row sm:items-start gap-4"
                      >
                        <div className="sm:w-44 shrink-0">
                          <span className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded uppercase tracking-wider mb-2">
                            {item.category}
                          </span>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-semibold">
                            <AlertTriangle className="h-3 w-3 text-amber-500" />
                            <span>IMPACT: {item.impact}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground text-sm leading-relaxed sm:text-base">{item.suggestion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: Raw Inputs (Demo) */}
            {activeTab === "resume" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                {/* Prefilled Resume Column */}
                <div className="flex flex-col h-[550px] rounded-xl border bg-card overflow-hidden">
                  <div className="bg-muted/40 p-4 border-b flex items-center justify-between shrink-0">
                    <span className="text-sm font-bold text-foreground flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-primary" />
                      Prefilled Resume (Input)
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">TEXT PARSED</span>
                  </div>
                  <textarea
                    readOnly
                    className="flex-1 p-4 text-xs font-mono bg-transparent outline-none resize-none overflow-y-auto leading-relaxed text-muted-foreground select-none"
                    value={sampleResumeText}
                  />
                </div>

                {/* Prefilled JD Column */}
                <div className="flex flex-col h-[550px] rounded-xl border bg-card overflow-hidden">
                  <div className="bg-muted/40 p-4 border-b flex items-center justify-between shrink-0">
                    <span className="text-sm font-bold text-foreground flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-primary animate-pulse" />
                      Target Job Description (Input)
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">AI PROMPTED</span>
                  </div>
                  <textarea
                    readOnly
                    className="flex-1 p-4 text-xs font-mono bg-transparent outline-none resize-none overflow-y-auto leading-relaxed text-muted-foreground select-none"
                    value={sampleJobDescription}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Premium Bottom Call To Action Banner */}
          <div className="max-w-5xl mx-auto mt-20 relative overflow-hidden rounded-2xl border bg-card p-8 md:p-12 text-center shadow-xl shadow-primary/5">
            {/* Background glowing rings */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06),transparent_70%)]" />
            <div className="absolute -top-24 -left-24 h-48 w-48 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-48 w-48 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="max-w-2xl mx-auto space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary">
                <Sparkles className="h-4 w-4 text-primary animate-spin" />
                Analyze Your Own Resume
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Ready to land that interview?
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Upload your resume, paste your dream job, and optimize your keywords with our robust, state-of-the-art AI parsing tool in under 10 seconds.
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/signup">
                  <Button size="lg" className="h-12 px-8 text-base w-full sm:w-auto font-semibold shadow-md bg-gradient-to-r from-primary to-blue-600 hover:from-primary/95 hover:to-blue-700">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base w-full sm:w-auto font-semibold">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
