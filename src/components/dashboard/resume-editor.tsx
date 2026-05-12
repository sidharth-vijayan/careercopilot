"use client";

import { useState, useRef } from "react";
import { Plus, Check, Pencil, RotateCcw, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResumeEditorProps {
  resumeText: string;
  missingSkills: string[];
  matchingSkills: string[];
  onSave: (updatedText: string) => void;
  onCancel: () => void;
}

export function ResumeEditor({
  resumeText,
  missingSkills,
  matchingSkills,
  onSave,
  onCancel,
}: ResumeEditorProps) {
  const [text, setText] = useState(resumeText);
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSkill = (skill: string) => {
    // Find the SKILLS section and append the skill
    const skillsSectionRegex = /(SKILLS|Skills|TECHNICAL SKILLS|Technical Skills)[^\n]*\n/i;
    const match = text.match(skillsSectionRegex);

    let updatedText: string;
    if (match && match.index !== undefined) {
      const afterSkills = text.substring(match.index + match[0].length);
      const nextSectionMatch = afterSkills.match(/\n[A-Z]{2,}[A-Z\s]*\n/);
      const insertPos = nextSectionMatch?.index
        ? match.index + match[0].length + nextSectionMatch.index
        : match.index + match[0].length + afterSkills.indexOf("\n\n");

      if (insertPos > match.index) {
        updatedText =
          text.substring(0, insertPos) +
          `\n${skill}` +
          text.substring(insertPos);
      } else {
        updatedText =
          text.substring(0, match.index + match[0].length) +
          `${skill}, ` +
          text.substring(match.index + match[0].length);
      }
    } else {
      const textarea = textareaRef.current;
      if (textarea && textarea.selectionStart !== undefined) {
        const pos = textarea.selectionStart;
        updatedText = text.substring(0, pos) + skill + text.substring(pos);
      } else {
        updatedText = text + `\n${skill}`;
      }
    }

    setText(updatedText);
    setAddedSkills((prev) => new Set(prev).add(skill));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume_optimized.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Resume Editor
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Click on missing skills below to insert them into your resume, then
            re-analyze.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => onSave(text)}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Re-analyze
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Keyword Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
              Missing Keywords
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Click to add to your resume
            </p>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill) => {
                const isAdded = addedSkills.has(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => !isAdded && insertSkill(skill)}
                    disabled={isAdded}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      isAdded
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 cursor-default"
                        : "bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer hover:scale-105 active:scale-95"
                    }`}
                  >
                    {isAdded ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
              Matched Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {matchingSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400"
                >
                  <Check className="h-3 w-3 mr-1" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" /> Copy to Clipboard
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" /> Download .txt
            </Button>
          </div>
        </div>

        {/* Text Editor */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="bg-muted/50 px-4 py-3 border-b flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                resume_content.txt
              </span>
              <span className="text-xs text-muted-foreground">
                {text.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[600px] bg-transparent px-4 py-4 text-sm text-foreground font-mono leading-relaxed focus:outline-none resize-y"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
