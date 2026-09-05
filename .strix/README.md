# Strix security scanning

[Strix](https://github.com/usestrix/strix) is an open-source AI pentesting agent.
It runs attacker tooling (HTTP proxy, headless browser, terminal) inside a Docker
sandbox and tries to *prove* vulnerabilities by exploiting them, so findings come
with reproductions instead of SAST guesses.

## One-time setup (done)

```bash
python -m venv .strix/venv
.strix/venv/Scripts/python -m pip install strix-agent
```

The venv (`/.strix/venv/`) and scan output (`/strix_runs/`) are gitignored.

## Running

Needs **Docker running** and an LLM key. Config is Strix's own env, not the app's:

```bash
export STRIX_LLM="gemini/gemini-2.5-pro"   # any litellm provider/model
export LLM_API_KEY="..."                    # falls back to GEMINI_API_KEY in .env
```

Then use the wrapper (or `/security-scan` inside Claude Code):

```powershell
./scripts/strix-scan.ps1                                # static review of the repo
./scripts/strix-scan.ps1 -Target http://localhost:3000 # live app (start `npm run dev` first)
./scripts/strix-scan.ps1 -Diff                          # only files changed vs main
```

Reports land in `strix_runs/<run-name>/`; `strix view` opens the dashboard.

## Worth scanning here

- `userId` WHERE-clause scoping on every mutation → IDOR
- `TailoredResume.shareId` public links → enumeration
- `resumes` Supabase bucket RLS
- prompt injection via job-description / resume text into `generateAIObject`

**Cost:** Strix burns a lot of LLM tokens, and a live scan spends the app's AI
quota if pointed at a real instance. Scan localhost, not prod.
