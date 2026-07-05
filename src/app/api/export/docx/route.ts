import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";

// 🏦 Helper: Authenticate user in route handler
async function getUserId() {
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
  return user?.id;
}

// Helper: borderless table for experience titles/dates
function createHeaderRow(leftTextBold: string, leftTextRegular: string, rightText: string) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                spacing: { after: 60, before: 60 },
                children: [
                  new TextRun({ text: leftTextBold, bold: true, font: "Times New Roman", size: 22 }),
                  leftTextRegular ? new TextRun({ text: ` | ${leftTextRegular}`, font: "Times New Roman", size: 22 }) : new TextRun(""),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 60, before: 60 },
                children: [
                  new TextRun({ text: rightText, font: "Times New Roman", size: 22, italics: true }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const draftId = searchParams.get("id");

    if (!draftId) {
      return NextResponse.json({ error: "Missing tailored resume id" }, { status: 400 });
    }

    // 1. Fetch Tailored Resume Data
    const draft = await prisma.tailoredResume.findUnique({
      where: { id: draftId, userId },
      include: {
        user: true
      }
    });

    if (!draft) {
      return NextResponse.json({ error: "Tailored resume not found" }, { status: 404 });
    }

    const data = draft.tailoredData as any;
    const userEmail = draft.user.email;
    const userName = draft.user.name || "YOUR NAME";

    // 2. Build Docx Structure
    const sections: any[] = [];

    // Header: Name (Bold, Big)
    sections.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: userName.toUpperCase(),
            bold: true,
            size: 32, // 16pt
            font: "Times New Roman",
          }),
        ],
      })
    );

    // Header Info
    sections.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: `${userEmail} | Singapore | linkedin.com/in/careercopilot-user`,
            font: "Times New Roman",
            size: 20, // 10pt
          }),
        ],
      })
    );

    // Section Helper
    const createSectionHeader = (title: string) => {
      return new Paragraph({
        spacing: { before: 240, after: 120 },
        border: {
          bottom: { color: "666666", space: 4, style: BorderStyle.SINGLE, size: 6 },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 24, // 12pt
            font: "Times New Roman",
          }),
        ],
      });
    };

    // 2a. Section: Professional Summary / Justification
    sections.push(createSectionHeader("Professional Summary"));
    sections.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: data.justification || "Highly motivated software engineer with experience optimizing system performance, leveraging AI-driven architectures, and building modern cloud deployments.",
            font: "Times New Roman",
            size: 22, // 11pt
          }),
        ],
      })
    );

    // 2b. Section: Technical Skills
    if (data.skills && Array.isArray(data.skills)) {
      sections.push(createSectionHeader("Technical Skills"));
      data.skills.forEach((skillGroup: any) => {
        sections.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: `${skillGroup.category}: `,
                bold: true,
                font: "Times New Roman",
                size: 22,
              }),
              new TextRun({
                text: skillGroup.items.join(", "),
                font: "Times New Roman",
                size: 22,
              }),
            ],
          })
        );
      });
    }

    // 2c. Section: Professional Experience
    if (data.experiences && Array.isArray(data.experiences)) {
      sections.push(createSectionHeader("Professional Experience"));
      data.experiences.forEach((exp: any) => {
        // Borderless metadata row
        sections.push(
          createHeaderRow(exp.title || "Software Engineer", "TechCorp Solutions", "Jan 2022 - Present")
        );

        // Tailored bullet points
        const bullets = exp.tailoredBullets || exp.originalBullets || [];
        bullets.forEach((bullet: string) => {
          sections.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 60, before: 30 },
              children: [
                new TextRun({
                  text: bullet,
                  font: "Times New Roman",
                  size: 22, // 11pt
                }),
              ],
            })
          );
        });
      });
    }

    // 2d. Section: Projects
    if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
      sections.push(createSectionHeader("Key Projects"));
      data.projects.forEach((proj: any) => {
        sections.push(
          createHeaderRow(proj.title || "Personal Project", "", "2023")
        );

        const bullets = proj.tailoredBullets || proj.originalBullets || [];
        bullets.forEach((bullet: string) => {
          sections.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 60, before: 30 },
              children: [
                new TextRun({
                  text: bullet,
                  font: "Times New Roman",
                  size: 22,
                }),
              ],
            })
          );
        });
      });
    }

    // 3. Assemble document with 1-inch margins (1440 dxa = 1 inch)
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                bottom: 1440,
                left: 1440,
                right: 1440,
              },
            },
          },
          children: sections,
        },
      ],
    });

    // 4. Generate docx buffer & download stream
    const buffer = await Packer.toBuffer(doc);
    const cleanJobTitle = (data.jobTitle || "Resume")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="tailored-${cleanJobTitle}.docx"`,
      },
    });
  } catch (error: any) {
    console.error("Export DOCX failed:", error);
    return NextResponse.json({ error: "Failed to generate Word document export." }, { status: 500 });
  }
}
