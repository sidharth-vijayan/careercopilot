/**
 * Seed the read-only demo account.
 *
 *   node scripts/seed-demo.mjs
 *
 * Creates (or reuses) the Supabase Auth user identified by DEMO_EMAIL /
 * DEMO_PASSWORD, flags the matching row `isDemo`, and fills it with realistic
 * data so the "Try the live demo" button lands on a populated dashboard rather
 * than an empty one.
 *
 * Re-runnable: existing demo data is replaced, not duplicated.
 *
 * If SUPABASE_SERVICE_ROLE_KEY is set the auth user is created pre-confirmed.
 * Without it the script falls back to a normal sign-up, which only works if
 * email confirmation is disabled for the project (Authentication → Providers →
 * Email → "Confirm email").
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: ".env.local" });

const {
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DATABASE_URL,
} = process.env;

function fail(message) {
  console.error(`\n  ✖ ${message}\n`);
  process.exit(1);
}

if (!SUPABASE_URL || !ANON_KEY) fail("NEXT_PUBLIC_SUPABASE_URL / ANON_KEY missing from .env.local");
if (!DEMO_EMAIL || !DEMO_PASSWORD) fail("Set DEMO_EMAIL and DEMO_PASSWORD in .env.local first.");
if (!DATABASE_URL) fail("DATABASE_URL missing from .env.local");

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: DATABASE_URL })),
});

/** Create the auth user, or return the existing one's id. */
async function ensureAuthUser() {
  if (SERVICE_KEY) {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });

    if (data?.user) return data.user.id;

    // Already exists — find it and reset the password so the env value is
    // guaranteed to work even if it changed since the last seed.
    if (error && /already/i.test(error.message)) {
      const { data: list } = await admin.auth.admin.listUsers();
      const existing = list?.users.find((u) => u.email === DEMO_EMAIL);
      if (!existing) fail("Demo user reported as existing but could not be found.");
      await admin.auth.admin.updateUserById(existing.id, {
        password: DEMO_PASSWORD,
        email_confirm: true,
      });
      return existing.id;
    }

    fail(`Could not create the demo auth user: ${error?.message}`);
  }

  // No service key: sign up (or sign in if it already exists) with the anon key.
  const anon = createClient(SUPABASE_URL, ANON_KEY);

  const signIn = await anon.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  if (signIn.data?.user) return signIn.data.user.id;

  const signUp = await anon.auth.signUp({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });
  if (signUp.error) fail(`Could not create the demo auth user: ${signUp.error.message}`);

  if (!signUp.data.session) {
    fail(
      "The demo user was created but needs email confirmation.\n" +
        "    Either disable email confirmation in Supabase (Authentication → Providers → Email),\n" +
        "    confirm it manually, or set SUPABASE_SERVICE_ROLE_KEY and re-run."
    );
  }

  return signUp.data.user.id;
}

const VAULT_ITEMS = [
  {
    type: "experience",
    title: "Software Engineering Intern — Sparkline",
    bulletPoints: [
      "Built an internal analytics dashboard in Next.js and TypeScript used daily by a 20-person operations team, cutting manual report assembly from ~4 hours to under 10 minutes each week.",
      "Migrated 12 REST endpoints to a typed service layer with Zod validation, eliminating a recurring class of production 500s caused by unvalidated payloads.",
      "Added Postgres indexes and query batching to the reporting path, reducing p95 dashboard load time from 3.1s to 640ms.",
      "Wrote the onboarding runbook now used for every new engineering intern.",
    ],
  },
  {
    type: "experience",
    title: "Backend Developer (Freelance) — Meridian Logistics",
    bulletPoints: [
      "Designed and shipped a shipment-tracking API in Node.js and Postgres serving ~50k requests/day at 99.9% uptime.",
      "Implemented idempotent webhook processing with a replay queue, removing duplicate-charge incidents entirely.",
      "Containerised the service with Docker and set up a GitHub Actions pipeline that cut deploy time from 25 minutes to 4.",
    ],
  },
  {
    type: "project",
    title: "Recut — AI Career Platform",
    bulletPoints: [
      "Full-stack Next.js 16 application with Supabase auth, Prisma/Postgres, and a dual-provider AI layer (Gemini with automatic Groq failover).",
      "Built a schema-validated AI pipeline that parses, validates and repairs model output, cutting malformed-response failures to near zero.",
      "Implemented per-user rate limiting, ATS-safe PDF/DOCX export, and a public share-link renderer.",
    ],
  },
  {
    type: "project",
    title: "Transit Delay Predictor",
    bulletPoints: [
      "Trained a gradient-boosted model on 2 years of public transit data to predict bus arrival delays within a 3-minute window 87% of the time.",
      "Served predictions through a FastAPI endpoint behind a Redis cache, holding p99 latency under 120ms.",
    ],
  },
  {
    type: "skill",
    title: "Languages & Frameworks",
    bulletPoints: ["TypeScript", "JavaScript", "Python", "SQL", "React", "Next.js", "Node.js", "FastAPI"],
  },
  {
    type: "skill",
    title: "Infrastructure & Tools",
    bulletPoints: ["PostgreSQL", "Prisma", "Docker", "GitHub Actions", "Redis", "Supabase", "Vercel", "Git"],
  },
];

const APPLICATIONS = [
  { jobTitle: "Backend Engineer, New Grad", company: "Razorpay", status: "interview", matchScore: 82, daysAgo: 6 },
  { jobTitle: "Software Engineer I", company: "Atlassian", status: "applied", matchScore: 74, daysAgo: 11 },
  { jobTitle: "Full Stack Engineer", company: "Zerodha", status: "offer", matchScore: 91, daysAgo: 28 },
  { jobTitle: "Platform Engineer", company: "Freshworks", status: "rejected", matchScore: 58, daysAgo: 34 },
  { jobTitle: "SDE Intern", company: "Swiggy", status: "rejected", matchScore: 63, daysAgo: 47 },
  { jobTitle: "Backend Developer", company: "CRED", status: "applied", matchScore: 78, daysAgo: 3 },
  { jobTitle: "Software Engineer (Data)", company: "Postman", status: "saved", matchScore: null, daysAgo: 1 },
  { jobTitle: "Junior Backend Engineer", company: "Hasura", status: "interview", matchScore: 85, daysAgo: 19 },
];

const ANALYSES = [
  { jobTitle: "Backend Engineer, New Grad", company: "Razorpay", matchScore: 82, missing: ["Kubernetes", "gRPC", "System Design"], matching: ["Node.js", "PostgreSQL", "Docker"], daysAgo: 6 },
  { jobTitle: "Software Engineer I", company: "Atlassian", matchScore: 74, missing: ["Java", "Kubernetes", "Distributed Systems"], matching: ["TypeScript", "React", "Git"], daysAgo: 11 },
  { jobTitle: "Full Stack Engineer", company: "Zerodha", matchScore: 91, missing: ["Kafka"], matching: ["React", "Node.js", "PostgreSQL", "Redis"], daysAgo: 28 },
  { jobTitle: "Platform Engineer", company: "Freshworks", matchScore: 58, missing: ["Kubernetes", "Terraform", "AWS", "Go"], matching: ["Docker", "CI/CD"], daysAgo: 34 },
  { jobTitle: "Backend Developer", company: "CRED", matchScore: 78, missing: ["Kafka", "System Design"], matching: ["Node.js", "PostgreSQL", "Redis"], daysAgo: 3 },
  { jobTitle: "Junior Backend Engineer", company: "Hasura", matchScore: 85, missing: ["GraphQL", "Haskell"], matching: ["TypeScript", "PostgreSQL", "Docker"], daysAgo: 19 },
];

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

const DEMO_RESUME_TEXT = `SIDDHARTH RAO
demo@recut.app | Bengaluru, India | linkedin.com/in/demo-candidate

SUMMARY
Backend-leaning full-stack engineer with internship and freelance experience building
production TypeScript and Python services. Comfortable owning a feature from schema to deploy.

EXPERIENCE
Software Engineering Intern — Sparkline (2025 - present)
- Built an internal analytics dashboard in Next.js used daily by a 20-person team.
- Migrated 12 REST endpoints to a typed, validated service layer.
- Cut p95 dashboard load time from 3.1s to 640ms through indexing and query batching.

Backend Developer (Freelance) — Meridian Logistics (2024 - 2025)
- Shipped a shipment-tracking API in Node.js and Postgres serving 50k requests/day.
- Implemented idempotent webhook processing with a replay queue.

PROJECTS
Recut — Full-stack AI career platform (Next.js, Prisma, Supabase, Gemini/Groq).
Transit Delay Predictor — Gradient-boosted arrival-delay model served via FastAPI.

SKILLS
TypeScript, JavaScript, Python, SQL, React, Next.js, Node.js, FastAPI,
PostgreSQL, Prisma, Docker, GitHub Actions, Redis, Supabase, Vercel, Git

EDUCATION
B.E. Computer Science, 2026`;

async function main() {
  console.log("→ Ensuring demo auth user…");
  const userId = await ensureAuthUser();
  console.log(`  demo auth user: ${userId}`);

  console.log("→ Writing demo profile…");
  await prisma.user.upsert({
    where: { id: userId },
    update: { isDemo: true },
    create: { id: userId, email: DEMO_EMAIL, isDemo: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: "Siddharth Rao",
      location: "Bengaluru, India",
      linkedinUrl: "linkedin.com/in/demo-candidate",
      githubUrl: "github.com/demo-candidate",
      isDemo: true,
    },
  });

  console.log("→ Clearing previous demo data…");
  // Order matters: analyses reference resumes.
  await prisma.jobAnalysis.deleteMany({ where: { userId } });
  await prisma.application.deleteMany({ where: { userId } });
  await prisma.vaultItem.deleteMany({ where: { userId } });
  await prisma.tailoredResume.deleteMany({ where: { userId } });
  await prisma.coverLetter.deleteMany({ where: { userId } });
  await prisma.interviewSession.deleteMany({ where: { userId } });
  await prisma.resume.deleteMany({ where: { userId } });

  console.log("→ Seeding resume, Vault, applications and analyses…");
  const resume = await prisma.resume.create({
    data: {
      userId,
      originalName: "Siddharth-Rao-Resume.pdf",
      // No file is uploaded to storage for the demo; the parsed text is what
      // every feature actually reads.
      fileUrl: `${userId}/demo-resume.pdf`,
      parsedText: DEMO_RESUME_TEXT,
      isDefault: true,
    },
  });

  await prisma.vaultItem.createMany({
    data: VAULT_ITEMS.map((item) => ({ ...item, userId })),
  });

  await prisma.application.createMany({
    data: APPLICATIONS.map((app) => ({
      userId,
      jobTitle: app.jobTitle,
      company: app.company,
      status: app.status,
      matchScore: app.matchScore,
      appliedAt: daysAgo(app.daysAgo),
    })),
  });

  for (const a of ANALYSES) {
    await prisma.jobAnalysis.create({
      data: {
        userId,
        resumeId: resume.id,
        jobTitle: a.jobTitle,
        company: a.company,
        jobDescription: `Demo job description for ${a.jobTitle} at ${a.company}.`,
        matchScore: a.matchScore,
        createdAt: daysAgo(a.daysAgo),
        analysisData: {
          jobTitle: a.jobTitle,
          company: a.company,
          matchScore: a.matchScore,
          summary: `Strong overlap on core backend skills; the main gaps are ${a.missing.slice(0, 2).join(" and ")}.`,
          missingSkills: a.missing,
          matchingSkills: a.matching,
          actionableFeedback: [
            { category: "Impact", suggestion: "Lead each bullet with the measurable outcome rather than the task." },
            { category: "Keywords", suggestion: `Mention ${a.missing[0]} explicitly if you have any exposure to it.` },
          ],
        },
      },
    });
  }

  console.log("→ Seeding a tailored draft…");
  await prisma.tailoredResume.create({
    data: {
      userId,
      jobTitle: "Backend Engineer, New Grad",
      company: "Razorpay",
      tailoredData: {
        jobTitle: "Backend Engineer, New Grad",
        company: "Razorpay",
        justification:
          "Led with the payments-adjacent reliability work and the highest-throughput service, since the posting emphasises correctness under load over breadth.",
        experiences: [
          {
            vaultItemId: "",
            title: "Backend Developer (Freelance) — Meridian Logistics",
            originalBullets: [
              "Shipped a shipment-tracking API in Node.js and Postgres serving ~50k requests/day at 99.9% uptime.",
              "Implemented idempotent webhook processing with a replay queue, removing duplicate-charge incidents entirely.",
            ],
            tailoredBullets: [
              "Designed and shipped a Node.js/PostgreSQL tracking API sustaining 50k requests/day at 99.9% uptime.",
              "Eliminated duplicate-charge incidents by implementing idempotent webhook processing backed by a replay queue.",
            ],
          },
          {
            vaultItemId: "",
            title: "Software Engineering Intern — Sparkline",
            originalBullets: [
              "Migrated 12 REST endpoints to a typed service layer with Zod validation.",
              "Added Postgres indexes and query batching to the reporting path.",
            ],
            tailoredBullets: [
              "Hardened 12 production REST endpoints behind a typed, schema-validated service layer, removing a recurring class of 500s.",
              "Cut p95 latency on the reporting path from 3.1s to 640ms via targeted PostgreSQL indexing and query batching.",
            ],
          },
        ],
        projects: [
          {
            vaultItemId: "",
            title: "Recut — AI Career Platform",
            originalBullets: ["Full-stack Next.js application with a dual-provider AI layer."],
            tailoredBullets: [
              "Built a fault-tolerant AI service layer with automatic provider failover and schema-validated responses, keeping the feature available through upstream outages.",
            ],
          },
        ],
        skills: [
          { category: "Languages", items: ["TypeScript", "JavaScript", "Python", "SQL"] },
          { category: "Backend", items: ["Node.js", "FastAPI", "PostgreSQL", "Prisma", "Redis"] },
          { category: "Infrastructure", items: ["Docker", "GitHub Actions", "Vercel"] },
        ],
      },
    },
  });

  console.log(`\n  ✔ Demo account ready — sign in as ${DEMO_EMAIL}\n`);
}

main()
  .catch((error) => {
    console.error("\n  ✖ Seed failed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
