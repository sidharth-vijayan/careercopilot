"use client";

import { useState } from "react";
import { ResumeUpload } from "@/components/dashboard/resume-upload";
import { JobAnalyzer } from "@/components/dashboard/job-analyzer";

export default function DashboardPage() {
  const [resumeText, setResumeText] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {resumeText ? "Analyze Job Description" : "Welcome back"}
        </h2>
        <p className="text-muted-foreground">
          {resumeText 
            ? "Paste the job description below to see how well your resume matches." 
            : "Upload a resume to get started with your analysis."}
        </p>
      </div>
      
      {!resumeText ? (
        <ResumeUpload onUploadSuccess={setResumeText} />
      ) : (
        <JobAnalyzer resumeText={resumeText} onReset={() => setResumeText(null)} />
      )}
    </div>
  );
}
