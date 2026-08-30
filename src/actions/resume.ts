"use server";

import crypto from "crypto";

import { revalidatePath } from "next/cache";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

import { ActionResponse } from "@/types";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { requireWritableUserId } from "@/lib/auth";
import { toActionError } from "@/lib/errors";
import { uuidInput } from "@/lib/schemas";

/**
 * Upload cap. The file is read fully into memory to be parsed, so without a
 * limit any signed-in user can exhaust the server's heap with one request.
 * Real resumes are well under a megabyte.
 */
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const PDF_MIME = "application/pdf";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function uploadAndParseResume(
  formData: FormData
): Promise<ActionResponse<{ text: string; resumeId: string }>> {
  try {
    const userId = await requireWritableUserId();
    const supabase = await createClient();

    const file = formData.get("resume") as File | null;
    if (!file) return { success: false, error: "No file provided." };

    if (file.size === 0) {
      return { success: false, error: "That file is empty." };
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return {
        success: false,
        error: `That file is ${(file.size / 1024 / 1024).toFixed(1)} MB. Please upload a resume under 5 MB.`,
      };
    }

    // `file.type` is set by the browser and is not trustworthy on its own, so
    // the extension has to agree with it before we hand the bytes to a parser.
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const isPdf = file.type === PDF_MIME && extension === "pdf";
    const isDocx = file.type === DOCX_MIME && extension === "docx";

    if (!isPdf && !isDocx) {
      return {
        success: false,
        error: "Unsupported file format. Please upload a PDF or DOCX file.",
      };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let parsedText = "";

    if (isPdf) {
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try {
        parsedText = (await parser.getText()).text;
      } finally {
        // Always release the parser, including when getText throws, or the
        // worker leaks for the lifetime of the server process.
        await parser.destroy();
      }
    } else {
      parsedText = (await mammoth.extractRawText({ buffer })).value;
    }

    if (!parsedText?.trim()) {
      return {
        success: false,
        error:
          "Could not extract any text from that file — it may be a scanned image. Try exporting a text-based PDF.",
      };
    }

    const fileName = `${userId}/${crypto.randomUUID()}.${extension}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from("resumes")
      .upload(fileName, file, { upsert: false, contentType: file.type });

    if (storageError) {
      console.error("[resume] storage upload failed:", storageError);
      return {
        success: false,
        error:
          "Failed to upload the file to storage. Make sure the 'resumes' bucket exists.",
      };
    }

    // First resume becomes the default, so Overview has something to analyze
    // against without the user having to pick one.
    const existing = await prisma.resume.count({ where: { userId } });

    const resume = await prisma.resume.create({
      data: {
        userId,
        originalName: file.name,
        fileUrl: storageData.path,
        parsedText,
        isDefault: existing === 0,
      },
      select: { id: true },
    });

    revalidatePath("/dashboard/resumes");
    revalidatePath("/dashboard");

    return { success: true, data: { text: parsedText, resumeId: resume.id } };
  } catch (error) {
    return toActionError(error, "Failed to parse that resume.");
  }
}

export async function updateResumeText(
  resumeId: string,
  parsedText: string
): Promise<ActionResponse> {
  try {
    const userId = await requireWritableUserId();
    const id = uuidInput.parse(resumeId);

    if (!parsedText.trim()) {
      return { success: false, error: "Resume text cannot be empty." };
    }
    if (parsedText.length > 100_000) {
      return { success: false, error: "That resume text is too long." };
    }

    const { count } = await prisma.resume.updateMany({
      where: { id, userId },
      data: { parsedText },
    });
    if (count === 0) return { success: false, error: "Resume not found." };

    revalidatePath("/dashboard/resumes");
    return { success: true };
  } catch (error) {
    return toActionError(error, "Could not save your changes.");
  }
}
