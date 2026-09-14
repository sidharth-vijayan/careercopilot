import type { Metadata } from "next";
import Link from "next/link";

import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie Policy | CareerCopilot",
  description:
    "Every cookie and browser storage key CareerCopilot uses, and why there is no cookie banner.",
};

export default function CookiesPage() {
  return (
    <>
      <h1>Cookie Policy</h1>
      <p className="text-sm">Last updated: {SITE.policyUpdated}</p>

      <p>
        Short version: {SITE.name} sets one kind of cookie — the one that keeps
        you signed in — and runs analytics that do not use cookies at all. There
        are no advertising, tracking or third-party marketing cookies anywhere in
        this site.
      </p>

      <h2 id="what">What is actually stored on your device</h2>

      <table>
        <caption className="sr-only">
          Cookies and browser storage used by CareerCopilot
        </caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Type</th>
            <th scope="col">Purpose and lifetime</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>sb-&lt;project&gt;-auth-token</code>
            </td>
            <td>First-party cookie (strictly necessary)</td>
            <td>
              Your Supabase session. It is what keeps you signed in between page
              loads; without it every click would log you out. Cleared when you
              sign out, and expires on its own after a period of inactivity.
            </td>
          </tr>
          <tr>
            <td>
              <code>sb-&lt;project&gt;-auth-token-code-verifier</code>
            </td>
            <td>First-party cookie (strictly necessary)</td>
            <td>
              A short-lived value used only while a sign-in is being completed,
              to protect the exchange. Deleted as soon as sign-in finishes.
            </td>
          </tr>
          <tr>
            <td>
              <code>theme</code>
            </td>
            <td>Local storage (not a cookie)</td>
            <td>
              Remembers whether you chose light, dark or system appearance. Set
              only when you use the theme toggle, stays until you clear your
              browser data, and is never sent to a server.
            </td>
          </tr>
        </tbody>
      </table>

      <p>
        That is the whole list. If you find something else in your browser
        storage on this site, please tell us at{" "}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>

      <h2 id="analytics">Analytics, without cookies</h2>

      <p>
        {SITE.name} uses Vercel Web Analytics to count page views — which pages
        get opened, and roughly where in the world from. It stores no cookie and
        no identifier on your device, and does not follow you to other sites.
        Visits are counted using a value derived on the server that changes
        daily, so there is no persistent profile of you to build or to sell.
      </p>

      <p>
        This is why the number you see is page views, not people, and why there
        is nothing here to opt a specific person out of. If you block the request
        anyway — most content blockers do — the site works exactly the same.
      </p>

      <h2 id="banner">Why there is no cookie banner</h2>

      <p>
        Consent banners exist because EU and UK rules require your permission
        before a site stores or reads anything on your device that is{" "}
        <em>not</em> strictly necessary for a service you asked for. Measured
        against that test:
      </p>

      <ul>
        <li>
          the sign-in cookies are strictly necessary — without them the account
          you asked for cannot work;
        </li>
        <li>
          the theme value is stored only because you clicked the toggle asking
          for it, and never leaves your browser;
        </li>
        <li>analytics stores nothing on your device at all.</li>
      </ul>

      <p>
        Nothing here needs consent, so asking for it would be a pop-up that does
        nothing. If a cookie that <em>did</em> need consent is ever added —
        advertising, remarketing, an embedded third-party player, a
        cross-site analytics product — a proper consent banner will be added with
        it, and it will default to off.
      </p>

      <h2 id="control">Controlling cookies yourself</h2>

      <p>
        Every browser lets you view, block and delete cookies and site data,
        usually under Privacy settings. Blocking cookies for this site is fine if
        you only want to read the public pages, but it will stop you signing in,
        because the session cookie is how an account stays open.
      </p>

      <h2 id="more">Related</h2>

      <p>
        For what happens to the data you put into the product — resumes, job
        descriptions, and the AI providers that process them — see the{" "}
        <Link href="/privacy">Privacy Policy</Link>. For the rules of using the
        service, see the <Link href="/terms">Terms of Use</Link>.
      </p>
    </>
  );
}
