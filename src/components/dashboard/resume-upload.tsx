"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadAndParseResume } from "@/actions/resume";
import { toast } from "@/lib/store/toast";

interface ResumeUploadProps {
  onUploadSuccess?: (text: string, resumeId: string) => void;
}

export function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } catch (error) {
      setStatus("error");
      setErrorMsg("An unexpected error occurred.");
      toast("Error", { description: "An unexpected error occurred during parsing.", type: "error" });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div 
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/50"
        } ${status === "success" ? "border-green-500 bg-green-500/5" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".pdf,.docx"
        />
        
        {status === "success" ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Upload Complete!</h3>
            <p className="text-muted-foreground text-sm">Your resume has been parsed successfully.</p>
            <Button variant="outline" onClick={(e) => { e.stopPropagation(); setStatus("idle"); setFile(null); }}>
              Upload Another
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <UploadCloud className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {file ? file.name : "Click or drag your resume here"}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Supports PDF and DOCX (Max 5MB)"}
              </p>
            </div>
            
            {status === "error" && (
              <div className="flex items-center text-destructive text-sm mt-2">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errorMsg}
              </div>
            )}
            
            <Button 
              className="mt-4" 
              disabled={!file || status === "uploading"} 
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
            >
              {status === "uploading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing Resume...
                </>
              ) : (
                "Analyze Resume"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
