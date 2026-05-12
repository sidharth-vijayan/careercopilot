"use server";

import { ActionResponse } from "@/types";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function uploadAndParseResume(formData: FormData): Promise<ActionResponse<{ text: string }>> {
  try {
    const file = formData.get("resume") as File | null;
    
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let parsedText = "";

    if (file.type === "application/pdf") {
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const result = await parser.getText();
      parsedText = result.text;
      await parser.destroy();
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const result = await mammoth.extractRawText({ buffer });
      parsedText = result.value;
    } else {
      return { success: false, error: "Unsupported file format. Please upload a PDF or DOCX file." };
    }

    if (!parsedText || parsedText.trim().length === 0) {
      return { success: false, error: "Could not extract text from the file. The file may be image-based." };
    }

    return { 
      success: true, 
      data: { 
        text: parsedText 
      } 
    };
  } catch (error: any) {
    console.error("Error parsing resume:", error);
    return { success: false, error: error.message || "Failed to parse resume" };
  }
}
