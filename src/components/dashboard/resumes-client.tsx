"use client";

import { useState } from "react";
import { FileText, Trash2, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteResume } from "@/actions/resumes";
import { toast } from "@/lib/store/toast";

interface Resume {
  id: string;
  originalName: string;
  createdAt: string;
  _count: {
    analyses: number;
  };
}

interface ResumesClientProps {
  initialResumes: Resume[];
}

export function ResumesClient({ initialResumes }: ResumesClientProps) {
  const [resumes, setResumes] = useState<Resume[]>(initialResumes);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const res = await deleteResume(id);
    setDeletingId(null);

    if (res.success) {
      setResumes((prev) => prev.filter((r) => r.id !== id));
      toast("Resume Deleted", {
        description: "Resume and related analyses have been removed.",
        type: "success",
      });
    } else {
      toast("Error", {
        description: res.error || "Failed to delete resume.",
        type: "error",
      });
    }
  };

  if (resumes.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          No resumes yet
        </h3>
        <p className="text-muted-foreground text-sm">
          Upload your first resume from the{" "}
          <a href="/dashboard" className="text-primary hover:underline">
            Overview
          </a>{" "}
          page to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {resumes.map((resume) => (
        <div
          key={resume.id}
          className="rounded-xl border bg-card p-5 shadow-sm flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">
                {resume.originalName}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(resume.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="h-3.5 w-3.5" />
                  {resume._count.analyses}{" "}
                  {resume._count.analyses === 1 ? "analysis" : "analyses"}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => handleDelete(resume.id)}
            disabled={deletingId === resume.id}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
