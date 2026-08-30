/**
 * Centralized AI provider with schema validation, repair-retry and failover.
 *
 * Every AI call in this app goes through here, which buys three things a bare
 * `fetch` to a model API does not:
 *
 *   1. **Failover** — Gemini (gemini-2.0-flash) is tried first; if it is down,
 *      rate-limited or misconfigured, Groq (llama-3.3-70b-versatile) serves the
 *      same prompt. One provider having a bad day is not an outage.
 *   2. **Schema validation** — `generateAIObject` parses the response against a
 *      Zod schema. LLMs return malformed or half-shaped JSON often enough that
 *      trusting `JSON.parse` alone means shipping crashes to users.
 *   3. **Repair-retry** — a response that parses but fails validation is sent
 *      back to the model with its own errors attached, which recovers the large
 *      majority of these without escalating to the fallback provider.
 *
 * Quota is consumed once per logical call, before any provider is contacted, so
 * a rejected request never costs the user a credit.
 */

import { GoogleGenAI } from "@google/genai";
import type { z } from "zod";

import { consumeAiCredit } from "@/lib/quota";
import { extractJson } from "@/lib/extract-json";

export { extractJson } from "@/lib/extract-json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AIProviderName = "gemini" | "groq";

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
  provider: AIProviderName;
}

/** Raised when every provider and retry has been exhausted. */
export class AIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIError";
  }
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

async function generateWithGemini(opts: AIGenerateOptions): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: opts.prompt,
    config:
      opts.jsonMode !== false
        ? { responseMimeType: "application/json" }
        : undefined,
  });

  if (!response.text) throw new Error("Gemini returned an empty response.");
  return response.text;
}

/** Groq via its OpenAI-compatible REST endpoint — no extra dependency needed. */
async function generateWithGroq(opts: AIGenerateOptions): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set");

  const body: Record<string, unknown> = {
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
    throw new Error(`Groq API error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned an empty response.");
  return text;
}

const PROVIDERS: Record<
  AIProviderName,
  { envKey: string; run: (o: AIGenerateOptions) => Promise<string> }
> = {
  gemini: { envKey: "GEMINI_API_KEY", run: generateWithGemini },
  groq: { envKey: "GROQ_API_KEY", run: generateWithGroq },
};

/** Providers that actually have a key configured, in preference order. */
export function availableProviders(): AIProviderName[] {
  return (["gemini", "groq"] as const).filter((p) => !!process.env[PROVIDERS[p].envKey]);
}

export function isAIConfigured(): boolean {
  return availableProviders().length > 0;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate raw text with automatic Gemini → Groq failover.
 * Prefer `generateAIObject` when you expect structured output.
 *
 * @throws AIError if every configured provider fails.
 */
export async function generateAIContent(
  opts: AIGenerateOptions
): Promise<AIGenerateResult> {
  const providers = availableProviders();
  if (providers.length === 0) {
    throw new AIError(
      "No AI provider is configured. Set GEMINI_API_KEY or GROQ_API_KEY."
    );
  }

  let lastError: unknown;

  for (const name of providers) {
    try {
      const text = await PROVIDERS[name].run(opts);
      return { text, provider: name };
    } catch (error) {
      lastError = error;
      console.warn(
        `[ai] ${name} failed: ${(error as Error)?.message ?? error}`
      );
    }
  }

  throw new AIError(
    `All AI providers failed (${providers.join(", ")}). Last error: ${
      (lastError as Error)?.message ?? lastError
    }`
  );
}

interface GenerateObjectOptions<T> {
  prompt: string;
  /** Zod schema the response must satisfy. */
  schema: z.ZodType<T>;
  /** When set, consumes one daily AI credit before calling any provider. */
  userId?: string;
  /** Short name used in logs, e.g. "analyze" or "cover-letter". */
  label: string;
}

/**
 * Generate a schema-validated object.
 *
 * Attempts, in order, until one yields a value satisfying `schema`:
 *   provider A → provider A with repair prompt → provider B → provider B repair
 *
 * @throws QuotaError if the user's daily allowance is spent.
 * @throws AIError    if no attempt produced a valid object.
 */
export async function generateAIObject<T>(
  opts: GenerateObjectOptions<T>
): Promise<{ data: T; provider: AIProviderName }> {
  const providers = availableProviders();
  if (providers.length === 0) {
    throw new AIError(
      "No AI provider is configured. Set GEMINI_API_KEY or GROQ_API_KEY."
    );
  }

  // Charge before any network call so a refusal is free.
  if (opts.userId) await consumeAiCredit(opts.userId);

  let lastError: unknown;

  for (const name of providers) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const prompt =
        attempt === 0
          ? opts.prompt
          : `${opts.prompt}\n\n--- CORRECTION ---\nYour previous response was rejected: ${
              (lastError as Error)?.message ?? lastError
            }\nReturn ONLY the corrected JSON object. No prose, no markdown fences.`;

      try {
        const text = await PROVIDERS[name].run({ prompt, jsonMode: true });
        const parsed = opts.schema.parse(extractJson(text));
        console.log(
          `[ai] ${opts.label} fulfilled by ${name}${attempt > 0 ? " (after repair)" : ""}`
        );
        return { data: parsed, provider: name };
      } catch (error) {
        lastError = error;
        console.warn(
          `[ai] ${opts.label} attempt ${attempt + 1} on ${name} failed: ${
            (error as Error)?.message ?? error
          }`
        );
      }
    }
  }

  throw new AIError(
    `The AI could not produce a valid response for "${opts.label}" after ${
      providers.length * 2
    } attempts. Please try again.`
  );
}
