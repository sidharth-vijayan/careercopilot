<#
.SYNOPSIS
  Run the Strix AI pentesting agent against CareerCopilot.

.DESCRIPTION
  Thin wrapper around the strix CLI installed in .strix/venv. Handles the
  boilerplate: Docker check, LLM env, target selection, run naming.

  LLM config comes from STRIX_LLM + LLM_API_KEY. If those aren't set, the
  script borrows GEMINI_API_KEY from .env (mapped to a Gemini model). Override
  either with real env vars before running.

.EXAMPLE
  ./scripts/strix-scan.ps1                      # static review of this repo
  ./scripts/strix-scan.ps1 -Target http://localhost:3000   # live app scan
  ./scripts/strix-scan.ps1 -Diff                # only changed files vs main
  ./scripts/strix-scan.ps1 -Interactive         # keep the TUI open
#>
param(
  [string]$Target = ".",
  [string]$Instruction,
  [switch]$Diff,
  [string]$DiffBase = "main",
  [switch]$Interactive
)
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$strix = Join-Path $root ".strix/venv/Scripts/strix.exe"

if (-not (Test-Path $strix)) {
  throw "strix not installed. Run: python -m venv .strix/venv; .strix/venv/Scripts/python -m pip install strix-agent"
}

# Docker must be running for the sandbox.
docker info *> $null
if ($LASTEXITCODE -ne 0) { throw "Docker isn't running. Start Docker Desktop and retry." }

# LLM config: explicit env wins; otherwise borrow the app's Gemini key.
if (-not $env:STRIX_LLM)     { $env:STRIX_LLM = "gemini/gemini-2.5-pro" }
if (-not $env:LLM_API_KEY) {
  $envFile = Join-Path $root ".env"
  if (Test-Path $envFile) {
    $g = (Get-Content $envFile | Where-Object { $_ -match '^\s*GEMINI_API_KEY\s*=' } | Select-Object -First 1)
    if ($g) { $env:LLM_API_KEY = ($g -replace '^\s*GEMINI_API_KEY\s*=\s*', '').Trim('"').Trim("'") }
  }
}
if (-not $env:LLM_API_KEY) {
  throw "No LLM key. Set LLM_API_KEY (and optionally STRIX_LLM), or add GEMINI_API_KEY to .env."
}

$strixArgs = @("--target", $Target)
if (-not $Interactive) { $strixArgs += "-n" }
if ($Instruction)      { $strixArgs += @("--instruction", $Instruction) }
if ($Diff)             { $strixArgs += @("--scope-mode", "diff", "--diff-base", $DiffBase) }

Write-Host "strix $($strixArgs -join ' ')  [LLM=$env:STRIX_LLM]" -ForegroundColor Cyan
& $strix @strixArgs
