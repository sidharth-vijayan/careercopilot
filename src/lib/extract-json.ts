/**
 * Recover a JSON value from a model response.
 *
 * Kept free of server-only imports so it can be unit-tested directly, and
 * because it is pure string handling with no dependency on the provider layer.
 */

export class JsonExtractionError extends Error {
  constructor(message = "The AI returned a response that was not valid JSON.") {
    super(message);
    this.name = "JsonExtractionError";
  }
}

/**
 * Models ignore "return only JSON" instructions often enough that this has to
 * be defensive: responses arrive wrapped in markdown fences, prefixed with a
 * sentence of commentary, or followed by trailing prose. Strip fences first,
 * then fall back to the outermost brace/bracket pair.
 */
export function extractJson(raw: string): unknown {
  let text = raw.trim();

  const fence = text.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/i);
  if (fence) text = fence[1].trim();

  try {
    return JSON.parse(text);
  } catch {
    // Fall through to brace matching.
  }

  // Whichever of { or [ appears first is treated as the start of the payload.
  const firstObj = text.indexOf("{");
  const firstArr = text.indexOf("[");
  const candidates: Array<[number, number]> = [];
  if (firstObj !== -1) candidates.push([firstObj, text.lastIndexOf("}")]);
  if (firstArr !== -1) candidates.push([firstArr, text.lastIndexOf("]")]);
  candidates.sort((a, b) => a[0] - b[0]);

  for (const [start, end] of candidates) {
    if (start === -1 || end <= start) continue;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      continue;
    }
  }

  throw new JsonExtractionError();
}
