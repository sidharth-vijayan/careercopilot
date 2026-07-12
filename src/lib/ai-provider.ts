/**
 * Centralized AI Provider with automatic Groq fallback.
 *
 * Flow:
 *   1. Try Google Gemini (gemini-2.0-flash) via @google/genai
 *   2. If Gemini fails (quota, rate-limit, invalid key, network error),
 *      automatically retry with Groq (llama-3.3-70b-versatile) via their
 *      OpenAI-compatible REST API — zero extra dependencies.
 *
 * Both providers are instructed to return raw JSON so the caller can parse
 * the result identically regardless of which provider fulfilled the request.
 */

import { GoogleGenAI } from "@google/genai";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AIGenerateOptions {
  /** The full prompt to send to the model */
  prompt: string;
  /** Whether to request JSON output (default: true) */
  jsonMode?: boolean;
}

interface AIGenerateResult {
  /** The raw text response from the model */
  text: string;
  /** Which provider actually fulfilled the request */
  provider: "gemini" | "groq";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isQuotaOrAuthError(error: any): boolean {
  const msg = error?.message?.toLowerCase?.() ?? "";
  const status = error?.status ?? error?.statusCode ?? 0;

  return (
    status === 429 ||
    status === 403 ||
    status === 400 ||
    msg.includes("quota") ||
    msg.includes("resource_exhausted") ||
    msg.includes("rate") ||
    msg.includes("api_key") ||
    msg.includes("api key") ||
    msg.includes("invalid") ||
    msg.includes("permission") ||
    msg.includes("billing") ||
    msg.includes("exceeded")
  );
}

// ---------------------------------------------------------------------------
// Gemini
// ---------------------------------------------------------------------------

async function generateWithGemini(opts: AIGenerateOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: opts.prompt,
    config: opts.jsonMode !== false
      ? { responseMimeType: "application/json" }
      : undefined,
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response.");
  }

  return response.text;
}

// ---------------------------------------------------------------------------
// Groq (OpenAI-compatible REST — no extra packages)
// ---------------------------------------------------------------------------

async function generateWithGroq(opts: AIGenerateOptions): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const body: Record<string, any> = {
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a precise AI assistant. Always respond ONLY with valid JSON — no markdown fences, no commentary, no trailing text.",
      },
      { role: "user", content: opts.prompt },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  };

  if (opts.jsonMode !== false) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Groq API error ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("Groq returned an empty response.");
  }

  return text;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate AI content with automatic Gemini → Groq fallback.
 *
 * @returns The model's text response and which provider was used.
 * @throws  Only if **both** providers fail.
 */
export async function generateAIContent(
  opts: AIGenerateOptions
): Promise<AIGenerateResult> {
  // --- Attempt 1: Gemini ---
  try {
    const text = await generateWithGemini(opts);
    return { text, provider: "gemini" };
  } catch (geminiError: any) {
    console.warn(
      `[AI Provider] Gemini failed: ${geminiError.message ?? geminiError}. Attempting Groq fallback…`
    );

    // Only fallback on quota/auth/config errors. For truly unexpected errors
    // (e.g. prompt too long), we still try Groq as a best effort.
    // But if Groq key is also missing, we'll propagate the original error.
    if (!process.env.GROQ_API_KEY) {
      throw geminiError; // No fallback available
    }
  }

  // --- Attempt 2: Groq ---
  try {
    const text = await generateWithGroq(opts);
    return { text, provider: "groq" };
  } catch (groqError: any) {
    console.error(
      `[AI Provider] Groq fallback also failed: ${groqError.message ?? groqError}`
    );
    throw new Error(
      `Both AI providers failed. Gemini and Groq are unavailable. Last error: ${groqError.message}`
    );
  }
}
