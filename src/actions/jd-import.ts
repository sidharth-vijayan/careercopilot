"use server";

import dns from "node:dns/promises";
import net from "node:net";

import { ActionResponse } from "@/types";
import { requireSyncedUserId } from "@/lib/auth";
import { toActionError } from "@/lib/errors";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 3;

/**
 * Import job-description text from a posting URL.
 *
 * This makes the server issue a request to a URL the user controls, which is a
 * server-side request forgery primitive if left unguarded: without checks it
 * could be pointed at `localhost`, an internal service, or a cloud metadata
 * endpoint (169.254.169.254) to read credentials. Every hop is therefore
 * resolved and range-checked before it is followed.
 */

/** Reject anything that isn't a publicly routable unicast address. */
function isBlockedAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 || // "this network"
      a === 10 || // private
      a === 127 || // loopback
      (a === 169 && b === 254) || // link-local, incl. cloud metadata
      (a === 172 && b >= 16 && b <= 31) || // private
      (a === 192 && b === 168) || // private
      (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
      a >= 224 // multicast + reserved
    );
  }

  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    // ::1 loopback, :: unspecified, fc00::/7 unique-local, fe80::/10 link-local
    if (normalized === "::1" || normalized === "::") return true;
    if (/^f[cd]/.test(normalized)) return true;
    if (/^fe[89ab]/.test(normalized)) return true;
    // IPv4-mapped (::ffff:10.0.0.1) must be checked against the v4 rules.
    const mapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isBlockedAddress(mapped[1]);
  }

  return false;
}

async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("That doesn't look like a valid URL.");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Only http and https links are supported.");
  }

  const host = url.hostname.replace(/^\[|\]$/g, "");

  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal") ||
    host.endsWith(".local")
  ) {
    throw new Error("That address isn't reachable.");
  }

  // A literal IP needs no lookup; a name is resolved so a hostname pointing at
  // a private address is caught too.
  const addresses = net.isIP(host)
    ? [host]
    : (await dns.lookup(host, { all: true })).map((a) => a.address);

  if (addresses.length === 0 || addresses.some(isBlockedAddress)) {
    throw new Error("That address isn't reachable.");
  }

  return url;
}

/** Strip markup and collapse whitespace into readable text. */
function htmlToText(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<\/(p|div|li|br|h[1-6]|tr)>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

export async function importJobDescription(
  rawUrl: string
): Promise<ActionResponse<{ text: string }>> {
  try {
    await requireSyncedUserId();

    let target = await assertPublicUrl(rawUrl.trim());

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      let response: Response | null = null;

      // Redirects are followed manually so each new location is re-validated;
      // `redirect: "follow"` would let a public URL bounce to a private one.
      for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
        response = await fetch(target, {
          redirect: "manual",
          signal: controller.signal,
          headers: {
            // Some boards return an error page to an unrecognised agent.
            "User-Agent":
              "Mozilla/5.0 (compatible; Recut/1.0; +https://github.com/sidharth-vijayan/recut)",
            Accept: "text/html,application/xhtml+xml",
          },
        });

        if (response.status < 300 || response.status >= 400) break;

        const location = response.headers.get("location");
        if (!location) break;
        target = await assertPublicUrl(new URL(location, target).toString());
        response = null;
      }

      if (!response) {
        return { success: false, error: "That link redirected too many times." };
      }

      if (!response.ok) {
        return {
          success: false,
          error: `The site returned ${response.status}. Many job boards block automated access — paste the description instead.`,
        };
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("html") && !contentType.includes("text")) {
        return { success: false, error: "That link isn't a web page." };
      }

      // Cap the body so a huge or endless response can't exhaust memory.
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > MAX_BYTES) {
        return { success: false, error: "That page is too large to import." };
      }

      const text = htmlToText(new TextDecoder().decode(buffer));

      if (text.length < 200) {
        return {
          success: false,
          error:
            "Couldn't find readable text there — sites like LinkedIn render postings with JavaScript. Copy and paste the description instead.",
        };
      }

      return { success: true, data: { text: text.slice(0, 20_000) } };
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { success: false, error: "That site took too long to respond." };
    }
    // assertPublicUrl throws plain Errors with user-facing messages.
    if (error instanceof Error && !("code" in error)) {
      return { success: false, error: error.message };
    }
    return toActionError(error, "Could not import from that link.");
  }
}
