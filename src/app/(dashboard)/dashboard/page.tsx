"use client";

import { useState } from "react";
import { ResumeUpload } from "@/components/dashboard/resume-upload";
import { JobAnalyzer } from "@/components/dashboard/job-analyzer";

export default function DashboardPage() {
  const [resumeState, setResumeState] = useState<{ text: string; id: string } | null>(null);

  const handleUploadSuccess = (text: string, id: string) => {
    setResumeState({ text, id });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {resumeState ? "Analyze Job Description" : "Welcome back"}
        </h2>
        <p className="text-muted-foreground">
          {resumeState 
            ? "Paste the job description below to see how well your resume matches." 
            : "Upload a resume to get started with your analysis."}
        </p>
      </div>
      
      {!resumeState ? (
        <ResumeUpload onUploadSuccess={handleUploadSuccess} />
      ) : (
        <JobAnalyzer 
          resumeText={resumeState.text} 
          resumeId={resumeState.id}
          onReset={() => setResumeState(null)} 
        />
      )}
    </div>
  );
}
