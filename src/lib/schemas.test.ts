import { describe, expect, it } from "vitest";

import {
  analysisSchema,
  applicationInput,
  bulletRewritesSchema,
  jobDescriptionInput,
  resumeFeedbackSchema,
  tailoredResumeSchema,
  vaultItemInput,
} from "@/lib/schemas";

/**
 * AI output is coerced where it is safely coercible, because rejecting a whole
 * response over a stringified number just burns a retry.
 */
describe("AI output schemas (lenient)", () => {
  it("coerces a stringified match score", () => {
    const result = analysisSchema.parse({ matchScore: "82" });
    expect(result.matchScore).toBe(82);
  });

  it("clamps an out-of-range score into 0–100", () => {
    expect(analysisSchema.parse({ matchScore: 140 }).matchScore).toBe(100);
    expect(analysisSchema.parse({ matchScore: -20 }).matchScore).toBe(0);
  });

  it("rounds a fractional score", () => {
    expect(analysisSchema.parse({ matchScore: 74.6 }).matchScore).toBe(75);
  });

  it("defaults missing lists to empty arrays rather than failing", () => {
    const result = analysisSchema.parse({ matchScore: 50 });
    expect(result.missingSkills).toEqual([]);
    expect(result.matchingSkills).toEqual([]);
    expect(result.actionableFeedback).toEqual([]);
    expect(result.jobTitle).toBe("Unknown Role");
  });

  it("maps an unrecognised severity to medium instead of rejecting", () => {
    // Models drift to "critical"/"minor" despite the prompt naming three values.
    const result = resumeFeedbackSchema.parse({
      overallScore: 70,
      warnings: [
        { severity: "critical", category: "Impact", message: "m", suggestion: "s" },
      ],
    });
    expect(result.warnings[0].severity).toBe("medium");
  });

  it("keeps valid severities untouched", () => {
    const result = resumeFeedbackSchema.parse({
      overallScore: 70,
      warnings: [
        { severity: "HIGH", category: "c", message: "m", suggestion: "s" },
      ],
    });
    expect(result.warnings[0].severity).toBe("high");
  });

  it("requires at least one bullet rewrite", () => {
    expect(() => bulletRewritesSchema.parse({ rewrites: [] })).toThrow();
  });

  it("fills absent sections of a tailored resume", () => {
    const result = tailoredResumeSchema.parse({ jobTitle: "Backend Engineer" });
    expect(result.experiences).toEqual([]);
    expect(result.projects).toEqual([]);
    expect(result.skills).toEqual([]);
    expect(result.company).toBe("Target Company");
  });
});

/**
 * User input is a trust boundary on the public internet — everything here is
 * persisted or forwarded to a paid AI provider, so it is validated strictly.
 */
describe("user input schemas (strict)", () => {
  it("rejects a job description that is too short to be real", () => {
    expect(() => jobDescriptionInput.parse("hiring devs")).toThrow();
  });

  it("accepts a realistic job description", () => {
    const jd = "We are hiring a backend engineer with Node.js and PostgreSQL experience.";
    expect(jobDescriptionInput.parse(jd)).toBe(jd);
  });

  it("rejects an oversized job description", () => {
    expect(() => jobDescriptionInput.parse("x".repeat(20_001))).toThrow();
  });

  it("trims surrounding whitespace", () => {
    const jd = `  ${"We need a senior platform engineer with Kubernetes experience."}  `;
    expect(jobDescriptionInput.parse(jd)).toBe(jd.trim());
  });

  it("drops empty bullet points from a vault item", () => {
    const result = vaultItemInput.parse({
      type: "experience",
      title: "Engineer",
      bulletPoints: ["Shipped a thing", "", "   ", "Shipped another"],
    });
    expect(result.bulletPoints).toEqual(["Shipped a thing", "Shipped another"]);
  });

  it("rejects an unknown vault item type", () => {
    expect(() =>
      vaultItemInput.parse({ type: "hobby", title: "x", bulletPoints: [] })
    ).toThrow();
  });

  it("rejects an empty vault item title", () => {
    expect(() =>
      vaultItemInput.parse({ type: "skill", title: "   ", bulletPoints: [] })
    ).toThrow();
  });

  it("rejects an unknown application status", () => {
    expect(() =>
      applicationInput.parse({
        jobTitle: "Engineer",
        company: "Acme",
        status: "ghosted",
      })
    ).toThrow();
  });

  it("accepts a valid application", () => {
    const result = applicationInput.parse({
      jobTitle: "Engineer",
      company: "Acme",
      status: "applied",
      matchScore: "77",
    });
    expect(result.matchScore).toBe(77);
  });
});
