import "server-only";

import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { jsPDF } from "jspdf";

import type { TailoredResumeData } from "@/lib/schemas";

export interface ResumeContact {
  name: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
}

/**
 * One ATS-safe resume layout, rendered to DOCX and PDF from the same model.
 *
 * Deliberately plain: single column, no tables, no graphics, standard section
 * headings. Applicant tracking systems parse this reliably; multi-column and
 * table-based layouts are where resumes get shredded.
 *
 * Nothing is invented. The previous exporter printed "TechCorp Solutions" and
 * "Jan 2022 - Present" for every role and a placeholder LinkedIn URL for every
 * user — fabricated employment details on a document people send to employers.
 * Fields we do not have are omitted instead.
 */

/** The contact line, skipping anything the user hasn't filled in. */
function contactLine(contact: ResumeContact): string {
  return [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedinUrl,
    contact.githubUrl,
    contact.websiteUrl,
  ]
    .map((v) => v?.trim())
    .filter((v): v is string => !!v)
    .join("  |  ");
}

interface Section {
  heading: string;
  entries: { title: string; bullets: string[] }[];
}

/** Shared content model both renderers walk. */
function buildModel(data: TailoredResumeData) {
  const sections: Section[] = [];

  if (data.experiences.length > 0) {
    sections.push({
      heading: "Experience",
      entries: data.experiences.map((e) => ({
        title: e.title,
        bullets: e.tailoredBullets.length > 0 ? e.tailoredBullets : e.originalBullets,
      })),
    });
  }

  if (data.projects.length > 0) {
    sections.push({
      heading: "Projects",
      entries: data.projects.map((p) => ({
        title: p.title,
        bullets: p.tailoredBullets.length > 0 ? p.tailoredBullets : p.originalBullets,
      })),
    });
  }

  return sections;
}

// ---------------------------------------------------------------------------
// DOCX
// ---------------------------------------------------------------------------

const FONT = "Calibri";

export async function buildResumeDocx(
  data: TailoredResumeData,
  contact: ResumeContact
): Promise<Buffer> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: contact.name.toUpperCase(), bold: true, size: 32, font: FONT }),
      ],
    })
  );

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [new TextRun({ text: contactLine(contact), size: 18, font: FONT })],
    })
  );

  const sectionHeading = (title: string) =>
    new Paragraph({
      spacing: { before: 240, after: 100 },
      border: {
        bottom: { color: "999999", space: 2, style: BorderStyle.SINGLE, size: 6 },
      },
      children: [
        new TextRun({ text: title.toUpperCase(), bold: true, size: 22, font: FONT }),
      ],
    });

  if (data.skills.length > 0) {
    children.push(sectionHeading("Skills"));
    for (const group of data.skills) {
      if (group.items.length === 0) continue;
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `${group.category}: `, bold: true, size: 20, font: FONT }),
            new TextRun({ text: group.items.join(", "), size: 20, font: FONT }),
          ],
        })
      );
    }
  }

  for (const section of buildModel(data)) {
    children.push(sectionHeading(section.heading));
    for (const entry of section.entries) {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [new TextRun({ text: entry.title, bold: true, size: 20, font: FONT })],
        })
      );
      for (const bullet of entry.bullets) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [new TextRun({ text: bullet, size: 20, font: FONT })],
          })
        );
      }
    }
  }

  const doc = new Document({ sections: [{ properties: {}, children }] });
  return Packer.toBuffer(doc);
}

// ---------------------------------------------------------------------------
// PDF
// ---------------------------------------------------------------------------

const PAGE = { width: 210, height: 297, margin: 16 }; // A4, millimetres
const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;

export function buildResumePdf(
  data: TailoredResumeData,
  contact: ResumeContact
): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = PAGE.margin;

  /** Start a new page when the next block would overflow the bottom margin. */
  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE.height - PAGE.margin) {
      doc.addPage();
      y = PAGE.margin;
    }
  };

  // Header
  doc.setFont("helvetica", "bold").setFontSize(18);
  doc.text(contact.name.toUpperCase(), PAGE.width / 2, y, { align: "center" });
  y += 6;

  doc.setFont("helvetica", "normal").setFontSize(9);
  const contactLines = doc.splitTextToSize(contactLine(contact), CONTENT_WIDTH);
  doc.text(contactLines, PAGE.width / 2, y, { align: "center" });
  y += contactLines.length * 4 + 3;

  const heading = (title: string) => {
    ensureSpace(12);
    y += 3;
    doc.setFont("helvetica", "bold").setFontSize(11);
    doc.text(title.toUpperCase(), PAGE.margin, y);
    y += 1.5;
    doc.setDrawColor(150).setLineWidth(0.3);
    doc.line(PAGE.margin, y, PAGE.width - PAGE.margin, y);
    y += 4.5;
  };

  if (data.skills.length > 0) {
    heading("Skills");
    doc.setFontSize(9.5);
    for (const group of data.skills) {
      if (group.items.length === 0) continue;

      const label = `${group.category}: `;
      doc.setFont("helvetica", "bold");
      const labelWidth = doc.getTextWidth(label);

      // Wrap the item list against the space left after the bold label, then
      // indent continuation lines to align under the first item.
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(
        group.items.join(", "),
        CONTENT_WIDTH - labelWidth
      );

      ensureSpace(lines.length * 4.5 + 2);
      doc.setFont("helvetica", "bold");
      doc.text(label, PAGE.margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(lines, PAGE.margin + labelWidth, y);
      y += lines.length * 4.5 + 1;
    }
  }

  for (const section of buildModel(data)) {
    heading(section.heading);

    for (const entry of section.entries) {
      ensureSpace(10);
      doc.setFont("helvetica", "bold").setFontSize(10);
      doc.text(entry.title, PAGE.margin, y);
      y += 4.5;

      doc.setFont("helvetica", "normal").setFontSize(9.5);
      for (const bullet of entry.bullets) {
        const lines = doc.splitTextToSize(bullet, CONTENT_WIDTH - 5);
        ensureSpace(lines.length * 4.3 + 1);
        doc.text("•", PAGE.margin + 1, y);
        doc.text(lines, PAGE.margin + 5, y);
        y += lines.length * 4.3 + 1;
      }
      y += 2;
    }
  }

  return Buffer.from(doc.output("arraybuffer"));
}

/** Filename stem like "Priya-Sharma-Backend-Engineer-Razorpay". */
export function resumeFileStem(
  contact: ResumeContact,
  data: TailoredResumeData
): string {
  return [contact.name, data.jobTitle, data.company]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join("-")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "resume";
}
