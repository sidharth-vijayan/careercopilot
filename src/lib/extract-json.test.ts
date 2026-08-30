import { describe, expect, it } from "vitest";

import { JsonExtractionError, extractJson } from "@/lib/extract-json";

/**
 * These cases are transcribed from actual malformed model output. Each one
 * previously crashed a server action with a bare `JSON.parse` SyntaxError.
 */
describe("extractJson", () => {
  it("parses a plain JSON object", () => {
    expect(extractJson('{"matchScore":82}')).toEqual({ matchScore: 82 });
  });

  it("strips ```json fences", () => {
    const raw = '```json\n{"matchScore": 82}\n```';
    expect(extractJson(raw)).toEqual({ matchScore: 82 });
  });

  it("strips bare ``` fences", () => {
    expect(extractJson('```\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("recovers an object buried in commentary", () => {
    const raw = 'Sure! Here is the analysis you asked for:\n{"a":1}\nHope that helps.';
    expect(extractJson(raw)).toEqual({ a: 1 });
  });

  it("recovers a top-level array", () => {
    expect(extractJson('[{"label":"Concise"}]')).toEqual([{ label: "Concise" }]);
  });

  it("prefers whichever of { or [ opens first", () => {
    // A prose prefix containing a bracket must not fool the extractor into
    // slicing from the wrong delimiter.
    const raw = 'Here you go {"items":["a","b"]}';
    expect(extractJson(raw)).toEqual({ items: ["a", "b"] });
  });

  it("tolerates surrounding whitespace and newlines", () => {
    expect(extractJson('\n\n  {"a": 1}  \n')).toEqual({ a: 1 });
  });

  it("throws a typed error when there is no JSON at all", () => {
    expect(() => extractJson("I'm sorry, I can't help with that.")).toThrow(
      JsonExtractionError
    );
  });

  it("throws rather than returning a partial object for truncated JSON", () => {
    // A response cut off by a token limit must fail loudly, not silently
    // produce half a result.
    expect(() => extractJson('{"a":1,"b":')).toThrow(JsonExtractionError);
  });
});
