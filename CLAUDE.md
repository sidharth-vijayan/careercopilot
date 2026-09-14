@AGENTS.md

# CareerCopilot — Project Context

AI career platform by Sidharth Vijayan. Built as a portfolio piece **and** a tool
he actually uses during job hunting. Both audiences matter: it has to look
credible to a hiring manager reading the code, and be pleasant to use daily.

## The product idea

The differentiator is the **Vault → Tailor loop**, not the individual AI tools:
write your experience once (every role, project, skill, with all the bullets),
then re-cut it per job description. Everything else — cover letters, interview
prep, chat — reads from that same Vault. Keep this front and centre; it's what
separates this from every other resume checker.

---

## Stack

Next.js 16 (App Router, Server Actions) · React 19 · TypeScript 5 (strict) ·
Tailwind v4 + shadcn/ui · Supabase (auth + storage) · Prisma 7 on Supabase
Postgres · Gemini → Groq AI failover · Recharts · Vitest · GitHub Actions → Vercel

**Next.js 16 note:** middleware is `src/proxy.ts` (renamed upstream). Read
`node_modules/next/dist/docs/` before assuming any API matches older Next.

---

## Architecture rules

These are load-bearing — breaking them reintroduces bugs that were already fixed.

### Authorization
All in `src/lib/auth.ts`. Never re-implement a Supabase client in an action.

- `requireUserId()` — auth only
- `requireSyncedUserId()` — **reads**; guarantees the `User` row exists
- `requireWritableUserId()` — **writes**; also rejects demo accounts
- `requireUserProfile()` — full profile row

Supabase Auth and our `User` table are separate stores; signup creates the former
only. Any insert with a `userId` FK must go through a `*Synced*` helper.

**Every mutation is scoped by `userId` in the WHERE clause** — `updateMany` /
`deleteMany` with `{ id, userId }`, checking `count === 0` for not-found. Never
fetch-then-check; never `update({ where: { id } })` alone.

### AI calls
Always `generateAIObject` from `src/lib/ai-provider.ts` for structured output —
never a raw provider call, never bare `JSON.parse`. It handles quota, failover,
extraction and repair-retry. Pass `userId` so the call is metered.
Prose-only calls (cover letter, chat) use `generateAIContent` **and must call
`consumeAiCredit` explicitly**.

### Validation (`src/lib/schemas.ts`)
Two different postures, deliberately:
- **AI output — lenient.** Coerce `"82"`→`82`, clamp `140`→`100`, map unknown
  severities to `medium`. Rejecting over a coercible field just burns a retry.
- **User input — strict.** This is the trust boundary; the app is public and
  runs on the owner's API keys.

Groq's `json_object` mode **rejects top-level arrays** — always wrap list
responses in an object (`{ "rewrites": [...] }`).

### Errors
Actions return `ActionResponse<T>` and catch with
`toActionError(error, fallback)`. Typed errors (Auth/Demo/Quota/AI/Zod) pass
their message through; anything else is logged server-side and replaced with a
generic line so DB internals never reach the browser.

### Data fetching
Pages are **server components** that fetch and pass data down; clients receive
`initialItems`-style props. Don't fetch on mount in an effect — the lint rule
`react-hooks/set-state-in-effect` will fail CI. After an AI call, call
`router.refresh()` so the header's quota chip updates.

### Charts
Single-series, one hue, identity from axis labels. Ordinal ramps for ordered
stages. **Never** green/red status pairs as adjacent series — indistinguishable
with deuteranopia. Keep the table view.

---

## Schema (Prisma)

`User` (+ `isDemo`, `aiCallsDate`/`aiCallsCount` quota, contact fields for
resume export) · `Resume` · `JobAnalysis` · `Application` · `VaultItem` ·
`TailoredResume` (+ `shareId` for public links) · `CoverLetter` ·
`InterviewSession`

All child tables index `userId` and cascade on user delete.

---

## Environment

See `.env.example`. `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY`, `DATABASE_URL`,
`DIRECT_URL`, one of `GEMINI_API_KEY`/`GROQ_API_KEY`, optional
`DAILY_AI_LIMIT` (default 20), `DEMO_EMAIL`/`DEMO_PASSWORD`, and
`SUPABASE_SERVICE_ROLE_KEY` (seed script, and `deleteAccount` — deleting the
Supabase Auth record needs admin rights; without the key the row survives and
erasure is incomplete). Server-side only, never `NEXT_PUBLIC_`.

### Legal pages
`/privacy`, `/terms` (refunds at `#refunds`) and `/cookies` live in the
`(legal)` route group and describe what the code actually does. Change the code
and the policy stops being true — update both, and bump `policyUpdated` in
`src/lib/site.ts`, which also holds the published contact address.

Supabase needs a storage bucket named **`resumes`**. Keep it **private** — uploads
and deletes run as the signed-in user under RLS, and the file is never read back
(parsed text is stored on `Resume`), so no public URL is required.

## Commands

```bash
npm run dev / build / lint / typecheck / test
npm run seed:demo      # seed the read-only demo account
npx prisma db push     # apply schema changes
```

---

## Known gaps / future improvements

Deliberate scope cuts, not broken code. Add when the pain is real, not before.

1. **Export templates** — only one layout in `src/lib/resume-document.ts`. Add
   more layouts here; ~1h each. Nice-to-have.
2. **Chat history** — per-session only. Needs a `ChatMessage` model + migration +
   load/save wiring. ~2h. Do it if chat gets heavy use.
3. **Pagination** — lists cap at 25–50 rows. Cursor pagination. Defer until a
   real list actually exceeds the cap.
4. **`sample-report`** — static/hardcoded landing showcase. Fine as-is; only wire
   it to real demo data if the hardcoding ever misleads.
5. **Email notifications** — none. No compelling trigger for a synchronous
   web app the owner opens directly; treat as YAGNI unless a real need appears.

## History worth knowing

- The original Supabase project was **deleted** (free-tier purge after ~90 days
  idle), taking all data with it. The current project is a fresh one.
- The old DOCX export hardcoded fake employment details ("TechCorp Solutions",
  "Jan 2022 - Present") onto real resumes. Replaced by
  `src/lib/resume-document.ts`, which omits fields it doesn't have. Never
  reintroduce placeholder employment data into an export.
