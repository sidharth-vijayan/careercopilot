<div align="center">

# 👨🏻‍💻 Recut

### Write your experience once. Tailor it to every job.

[![CI](https://github.com/sidharth-vijayan/recut/actions/workflows/ci.yml/badge.svg)](https://github.com/sidharth-vijayan/recut/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

**[Live demo](#) · no signup required**

</div>

---

## The problem

Tailoring a resume per application is the advice everyone gives and nobody
follows, because it means rewriting the same six bullet points from scratch for
every posting. So people send the same generic resume to forty companies and get
filtered out by keyword-matching ATS software before a human reads it.

## The approach

Keep the experience, not the document.

You fill a **Vault** once — every role, project and skill, with all the bullet
points, including the ones that would never fit on a one-page resume. Then for
each job you paste the description, and Recut selects the relevant
subset, rewrites each bullet around that posting's language, and gives you a
document to send.

```
   Vault (write once)          Job description          Tailored resume
  ┌──────────────────┐        ┌──────────────┐        ┌────────────────┐
  │ 4 roles          │        │              │        │ 2 roles        │
  │ 6 projects       │───────▶│  relevance   │───────▶│ 1 project      │
  │ 40 bullets       │        │  + rewrite   │        │ 9 bullets,     │
  │ 30 skills        │        │              │        │ ATS-keyworded  │
  └──────────────────┘        └──────────────┘        └────────────────┘
                                                       PDF · DOCX · link
```

Everything else in the app hangs off that same Vault: cover letters, interview
questions, and the career chat all read from it, so they're grounded in your
actual experience rather than generic advice.

---

## Features

| | |
|---|---|
| **The Vault** | Your experience bank — roles, projects and skills, stored once. |
| **Instant Tailor** | Picks the relevant Vault items for a posting and rewrites the bullets around its keywords. Every draft is saved, with a side-by-side view of what changed. |
| **Job match analysis** | ATS-style match score, matching vs missing skills, and specific fixes. |
| **AI Improver** | Scores a resume, flags weak bullets by severity, and rewrites any bullet in four styles. |
| **Interview Prep** | Generates the questions this posting would actually ask *you*, grades your answers, and rewrites them. |
| **Cover letters** | Drafted from the Vault, saved and searchable. |
| **Ask AI** | Career questions answered against your own resume and Vault. |
| **Application tracker** | Pipeline by status, with notes and match scores. |
| **Analytics** | Funnel, application cadence, match-score distribution, and the skill gaps that keep recurring. |
| **Export & share** | ATS-safe PDF and DOCX, or a public read-only link at `/r/<id>`. |

---

## Engineering notes

The parts that were more interesting than CRUD.

### Two AI providers, one interface

A single-provider AI feature is down whenever that provider is. Every AI call in
the app goes through [`src/lib/ai-provider.ts`](src/lib/ai-provider.ts), which
tries Gemini (`gemini-2.0-flash`) first and falls back to Groq
(`llama-3.3-70b-versatile`) on failure. Groq is reached over its
OpenAI-compatible REST endpoint, so the fallback path costs zero extra
dependencies.

### Treating model output as untrusted input

LLMs return JSON wrapped in markdown fences, prefixed with "Sure! Here's...",
or shaped subtly wrong — a score as `"82"`, a severity of `"critical"` when the
schema says `high`. A bare `JSON.parse` turns each of these into a 500.

`generateAIObject` runs a four-stage ladder before giving up:

```
provider A → parse + validate
   ↓ fails
provider A + repair prompt (the validation errors are fed back to the model)
   ↓ fails
provider B → parse + validate
   ↓ fails
provider B + repair prompt        → typed AIError, handled by the caller
```

Extraction ([`extract-json.ts`](src/lib/extract-json.ts)) strips fences and
falls back to outermost-brace matching; validation
([`schemas.ts`](src/lib/schemas.ts)) uses Zod schemas that are deliberately
**lenient on AI output** — coercing `"82"` to `82`, clamping `140` to `100`,
mapping unknown severities to `medium` — because rejecting a whole response over
a coercible field just burns a retry. The same file's **user-input** schemas are
strict, because that's the trust boundary.

### Rate limiting on someone else's dime

The deployment runs on my own API keys, so an open signup is an open invitation
to drain them. [`quota.ts`](src/lib/quota.ts) enforces a per-user daily cap with
two guarded `UPDATE`s — the increment is conditional on `count < limit`, so
Postgres evaluates the check and the cap can't be exceeded by concurrent
requests. Credits are consumed *before* the provider call, so a rejected request
costs nothing.

### Not fetching arbitrary URLs, carelessly

The "import from a link" feature makes the server fetch a user-supplied URL,
which is a textbook SSRF primitive. [`jd-import.ts`](src/actions/jd-import.ts)
resolves each hostname and rejects private, loopback, link-local and
carrier-grade-NAT ranges — including IPv4-mapped IPv6 — and follows redirects
manually so every hop is re-validated rather than letting a public URL bounce to
`169.254.169.254`.

### Charts that survive their readers

Every chart on the analytics page is single-series, so identity comes from axis
labels rather than colour. Pipeline stages use an ordinal ramp of one hue,
validated for monotone lightness and step separation in both themes. Status
colours (green/red) are deliberately *not* used for the stage bars — that pair
is near-indistinguishable with deuteranopia — so they appear only on tiles where
a word carries the meaning. A table view is one click away.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) + React 19 |
| Language | TypeScript 5, strict |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | Supabase Auth (SSR cookies via `@supabase/ssr`) |
| Database | Supabase Postgres via Prisma 7 |
| AI | Google Gemini → Groq failover |
| Docs | `pdf-parse`, `mammoth` (in), `jspdf`, `docx` (out) |
| Charts | Recharts |
| Testing | Vitest |
| CI/CD | GitHub Actions → Vercel |

---

## Running locally

**Prerequisites:** Node 22+, a Supabase project, and at least one AI API key
([Gemini](https://aistudio.google.com/apikey) or
[Groq](https://console.groq.com/keys) — both have free tiers).

```bash
git clone https://github.com/sidharth-vijayan/recut.git
cd recut
npm install
cp .env.example .env.local     # then fill it in
npx prisma db push
npm run dev
```

In Supabase, create a **private storage bucket named `resumes`** — uploads fail
without it. Private is correct: uploads and deletes run as the signed-in user
under RLS, and the file is never read back (the parsed text is stored in the
database), so nothing needs a public URL.

### Optional: seed the read-only demo account

```bash
npm run seed:demo
```

Creates the account behind the "Try the live demo" button and fills it with
realistic data. Requires `DEMO_EMAIL` and `DEMO_PASSWORD` in `.env.local`.

### Commands

```bash
npm run dev        # dev server
npm run build      # production build
npm test           # unit tests
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run seed:demo  # seed the demo account
```

### Docker

```bash
docker compose up --build
docker compose exec app npx prisma db push   # first run only
```

Runs the app against a local Postgres; auth and storage still use your hosted
Supabase project.

---

## Architecture

```
src/
├── actions/         # Server Actions — one file per domain
│   ├── analyze.ts       resume ↔ JD match analysis
│   ├── vault.ts         Vault CRUD + the tailoring engine
│   ├── interview.ts     question generation + answer grading
│   ├── jd-import.ts     SSRF-guarded URL importer
│   └── …
├── lib/
│   ├── ai-provider.ts   failover, repair-retry, schema validation
│   ├── schemas.ts       Zod schemas (lenient out, strict in)
│   ├── quota.ts         per-user daily AI cap
│   ├── auth.ts          shared session/authorization helpers
│   └── resume-document.ts  one layout → PDF and DOCX
├── app/
│   ├── (auth)/          login, signup
│   ├── (dashboard)/     the product
│   ├── r/[shareId]/     public read-only resume
│   └── api/export/      PDF / DOCX download
└── components/
```

Authorization lives in `lib/auth.ts` and is applied per action:
`requireSyncedUserId` for reads, `requireWritableUserId` for writes (which also
rejects the demo account). Every mutation is scoped by `userId` in the `WHERE`
clause rather than checked after the fact, so a request for someone else's row
affects zero rows instead of leaking one.

---

## Status & roadmap

Working and deployed. Not yet built:

- [ ] Email notifications for follow-up reminders (needs a transactional email provider)
- [ ] Multiple resume templates — one ATS-safe layout today
- [ ] Persisted chat history — conversations are per-session
- [ ] Pagination — list views cap at 25–50 rows

---

<div align="center">

Built by [Sidharth Vijayan](https://github.com/sidharth-vijayan)

</div>
