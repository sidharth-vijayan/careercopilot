"use server";

import { ActionResponse } from "@/types";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import prisma from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import crypto from "crypto";

async function getUserIdAndSupabase() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return { userId: user?.id, supabase };
}

export async function uploadAndParseResume(formData: FormData): Promise<ActionResponse<{ text: string, resumeId: string }>> {
  try {
    const { userId, supabase } = await getUserIdAndSupabase();
    if (!userId) return { success: false, error: "Unauthorized" };

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

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${crypto.randomUUID()}.${fileExt}`;
    
    const { data: storageData, error: storageError } = await supabase.storage
      .from("resumes")
      .upload(fileName, file, {
        upsert: false,
        contentType: file.type,
      });

    if (storageError) {
      console.error("Storage upload error:", storageError);
      return { success: false, error: "Failed to upload file to storage. Did you create the 'resumes' bucket?" };
    }

    // Save to Prisma
    const resume = await prisma.resume.create({
      data: {
        userId,
        originalName: file.name,
        fileUrl: storageData.path,
        parsedText,
      }
    });

    return { 
      success: true, 
      data: { 
        text: parsedText,
        resumeId: resume.id
      } 
    };
  } catch (error: any) {
    console.error("Error parsing resume:", error);
    return { success: false, error: error.message || "Failed to parse resume" };
  }
}

export async function updateResumeText(resumeId: string, parsedText: string): Promise<ActionResponse> {
  try {
    const { userId } = await getUserIdAndSupabase();
    if (!userId) return { success: false, error: "Unauthorized" };

    await prisma.resume.update({
      where: { id: resumeId, userId },
      data: { parsedText }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
