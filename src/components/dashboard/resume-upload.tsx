"use client";

import { useState } from "react";
import Link from "next/link";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadAndParseResume } from "@/actions/resume";
import { toast } from "@/lib/store/toast";

interface ResumeUploadProps {
  onUploadSuccess?: (text: string, resumeId: string) => void;
}

/**
 * Resume dropzone.
 *
 * The picker is a real `<input type="file">` labelled by the dropzone text
 * rather than a hidden input poked by a div's onClick: `display: none` takes
 * the input out of the tab order, which left the whole upload flow — the first
 * thing a new account has to do — unreachable without a mouse.
 */
export function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(selectedFile.type)) {
      setStatus("error");
      setErrorMsg("Please upload a PDF or DOCX file.");
      toast("Invalid file type", { description: "Please upload a PDF or DOCX file.", type: "error" });
      return;
    }

    setFile(selectedFile);
    setStatus("idle");
    setErrorMsg("");
  };

  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const result = await uploadAndParseResume(formData);

      if (result.success && result.data) {
        setStatus("success");
        toast("Resume Parsed", { description: "Successfully extracted text from your resume.", type: "success" });
        if (onUploadSuccess) {
          onUploadSuccess(result.data.text, result.data.resumeId);
        }
      } else {
        setStatus("error");
        setErrorMsg(result.error || "Failed to parse resume.");
        toast("Parsing Failed", { description: result.error || "Failed to parse resume.", type: "error" });
      }
    } catch {
      setStatus("error");
      setErrorMsg("An unexpected error occurred.");
      toast("Error", { description: "An unexpected error occurred during parsing.", type: "error" });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div
        className={`rounded-xl border-2 border-dashed p-10 text-center transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background ${
          isDragging ? "border-primary bg-primary/5" : "border-border bg-card"
        } ${status === "success" ? "border-green-600 bg-green-500/5 dark:border-green-500" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-700 dark:text-green-400" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Upload complete</h3>
            <p className="text-muted-foreground text-sm">Your resume has been parsed successfully.</p>
            <Button variant="outline" onClick={() => { setStatus("idle"); setFile(null); }}>
              Upload another resume
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <input
              id="resume-file"
              type="file"
              onChange={handleFileChange}
              className="sr-only"
              accept=".pdf,.docx"
            />

            {/* The label is the click target, so the input needs no onClick
                shim and keyboard users reach it by tabbing to the input. */}
            <label htmlFor="resume-file" className="flex cursor-pointer flex-col items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                {file ? (
                  <FileText className="h-8 w-8 text-primary" aria-hidden="true" />
                ) : (
                  <UploadCloud className="h-8 w-8 text-primary" aria-hidden="true" />
                )}
              </span>
              <span className="block">
                <span className="block text-xl font-semibold text-foreground">
                  {file ? file.name : "Choose a resume, or drag one here"}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {file
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB — ready to upload`
                    : "PDF or DOCX, up to 5 MB"}
                </span>
              </span>
            </label>

            {status === "error" && (
              <p role="alert" className="flex items-center text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                {errorMsg}
              </p>
            )}

            <Button
              className="mt-4"
              disabled={!file || status === "uploading"}
              onClick={handleUpload}
            >
              {status === "uploading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Parsing resume…
                </>
              ) : (
                "Upload and analyze resume"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Stated at the point of upload, not only in the policy: this is the
          moment someone hands over a document full of personal data. */}
      <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
        Your file is stored privately and the text inside it is sent to
        third-party AI providers (Google, and Groq as fallback) when you run an
        analysis. You can delete it any time.{" "}
        <Link href="/privacy#ai" className="underline underline-offset-2 hover:text-foreground">
          How your resume is handled
        </Link>
        .
      </p>
    </div>
  );
}
