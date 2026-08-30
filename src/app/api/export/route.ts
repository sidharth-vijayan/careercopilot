import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { tailoredResumeSchema } from "@/lib/schemas";
import {
  buildResumeDocx,
  buildResumePdf,
  resumeFileStem,
  type ResumeContact,
} from "@/lib/resume-document";

const MIME = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
} as const;

type Format = keyof typeof MIME;

/**
 * GET /api/export?id=<tailoredResumeId>&format=docx|pdf
 *
 * Renders a saved tailored resume as a downloadable document.
 */
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const draftId = searchParams.get("id");
  const format = (searchParams.get("format") ?? "pdf").toLowerCase();

  if (!draftId) {
    return NextResponse.json({ error: "Missing tailored resume id." }, { status: 400 });
  }
  if (format !== "docx" && format !== "pdf") {
    return NextResponse.json(
      { error: "Unsupported format. Use 'pdf' or 'docx'." },
      { status: 400 }
    );
  }

  const draft = await prisma.tailoredResume.findFirst({
    where: { id: draftId, userId: user.id },
    include: { user: true },
  });

  if (!draft) {
    return NextResponse.json({ error: "Tailored resume not found." }, { status: 404 });
  }

  // Stored JSON is whatever the model produced when it was saved, so re-validate
  // rather than trusting the column's shape at render time.
  const parsed = tailoredResumeSchema.safeParse(draft.tailoredData);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "This draft's data is incomplete and can't be exported." },
      { status: 422 }
    );
  }

  const contact: ResumeContact = {
    // Falls back to the local part of the email so the header is never blank;
    // the user can set a proper name in Settings.
    name: draft.user.name?.trim() || draft.user.email.split("@")[0],
    email: draft.user.email,
    phone: draft.user.phone,
    location: draft.user.location,
    linkedinUrl: draft.user.linkedinUrl,
    githubUrl: draft.user.githubUrl,
    websiteUrl: draft.user.websiteUrl,
  };

  const stem = resumeFileStem(contact, parsed.data);

  const body =
    format === "docx"
      ? await buildResumeDocx(parsed.data, contact)
      : buildResumePdf(parsed.data, contact);

  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": MIME[format as Format],
      "Content-Disposition": `attachment; filename="${stem}.${format}"`,
      "Cache-Control": "no-store",
    },
  });
}
