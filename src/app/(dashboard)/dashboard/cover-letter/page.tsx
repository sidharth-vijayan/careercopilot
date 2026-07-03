import { Metadata } from "next";
import { CoverLetterClient } from "@/components/dashboard/cover-letter-client";

export const metadata: Metadata = {
  title: "Cover Letter Generator | CareerCopilot",
  description: "Generate a highly-tailored cover letter based on your Vault experience and the job description.",
};

export default function CoverLetterPage() {
  return <CoverLetterClient />;
}
