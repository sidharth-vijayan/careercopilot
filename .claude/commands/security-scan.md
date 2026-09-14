---
description: Run the Strix AI pentester against Recut and report findings
---

Run the Strix AI penetration-testing agent, then summarize what it found.

Arguments (optional): `$ARGUMENTS`
- empty              → static review of this repo (`-Target .`)
- a URL              → live scan of that running instance
- the word `diff`    → scope to files changed vs `main`

Steps:
1. Confirm Docker is running (`docker info`); if not, tell the user to start Docker Desktop and stop.
2. Confirm an LLM key is available: either `LLM_API_KEY` in the env or `GEMINI_API_KEY` in `.env`. If neither, ask the user to set one and stop.
3. Run `./scripts/strix-scan.ps1` with the target derived from the arguments above. For a live scan, the dev server must already be up (`npm run dev`, port 3000) — don't start it yourself without asking.
4. When it finishes, read the report under `strix_runs/<run-name>/` and give the user a ranked summary: each finding's severity, the vulnerable location, and the reproduction. Flag anything touching the Recut hot spots: `userId` WHERE-clause scoping (IDOR), `TailoredResume.shareId` public links, the `resumes` bucket RLS, and prompt injection via job-description / resume text into `generateAIObject`.

Note: Strix burns a lot of LLM tokens and, for live scans, spends the app's AI quota if pointed at a real instance. Confirm before scanning anything other than localhost.
