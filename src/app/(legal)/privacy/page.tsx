import type { Metadata } from "next";
import Link from "next/link";

import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy | CareerCopilot",
  description:
    "What CareerCopilot collects, who processes it, how long it is kept, and how to export or delete it.",
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="text-sm">Last updated: {SITE.policyUpdated}</p>

      <p>
        {SITE.name} is run by {SITE.operator}, {SITE.operatorType}, based in{" "}
        {SITE.location}. For data-protection purposes {SITE.operator} is the
        controller of the personal data described below. Questions, or any
        request about your data, go to{" "}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>

      <p>
        This is a free personal project, not a company, and the policy is written
        to match what the code actually does — the source is{" "}
        <a href={SITE.repoUrl}>public</a> if you want to check.
      </p>

      <h2 id="collect">What we collect</h2>

      <p>
        Only what the product needs to work. There is no advertising, no
        profiling, no data broker, and nothing is sold or shared for marketing.
      </p>

      <table>
        <caption className="sr-only">
          Categories of personal data collected by CareerCopilot
        </caption>
        <thead>
          <tr>
            <th scope="col">Data</th>
            <th scope="col">Why</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Email address</td>
            <td>Identifies your account and is how you sign in.</td>
          </tr>
          <tr>
            <td>Password</td>
            <td>
              Handled entirely by our authentication provider, Supabase, and
              stored only as a hash. {SITE.name} never receives or stores your
              password.
            </td>
          </tr>
          <tr>
            <td>
              Optional profile: name, phone, location, LinkedIn, GitHub and
              website links
            </td>
            <td>
              Printed in the header of resumes you export. Every one of these is
              optional; blank fields are left off the document.
            </td>
          </tr>
          <tr>
            <td>
              Resume files you upload (PDF or DOCX) and the text extracted from
              them
            </td>
            <td>
              The extracted text is what the AI features read. Files are stored
              in a private bucket that is not publicly readable.
            </td>
          </tr>
          <tr>
            <td>
              Content you create: Vault entries, job descriptions, analyses,
              tailored resumes, cover letters, interview sessions and application
              records
            </td>
            <td>So your work is there when you come back.</td>
          </tr>
          <tr>
            <td>A daily count of AI generations used</td>
            <td>
              Enforces the fair-use limit described in the{" "}
              <Link href="/terms#limits">Terms</Link>. It is a number and a date,
              not a log of what you generated.
            </td>
          </tr>
          <tr>
            <td>Aggregate page analytics</td>
            <td>
              Vercel Web Analytics counts page views without cookies and without
              building a profile of you. See the{" "}
              <Link href="/cookies">Cookie Policy</Link>.
            </td>
          </tr>
        </tbody>
      </table>

      <p>
        We do not collect payment details, because {SITE.name} does not charge
        for anything. We do not ask for your date of birth, gender, government ID
        or any other special-category data — please do not put such details in
        your Vault or resume text if you would rather they were not stored here.
      </p>

      <h2 id="ai">Your resume is sent to AI providers</h2>

      <p>
        This is the part worth reading twice. When you run an analysis, tailor a
        resume, rewrite a bullet, generate a cover letter, prepare for an
        interview or use the chat, the relevant text — which includes your resume
        content and the job description — is sent to a third-party AI model to be
        processed:
      </p>

      <ul>
        <li>
          <strong>Google (Gemini API)</strong> — used first.
        </li>
        <li>
          <strong>Groq</strong> — used automatically when Gemini is unavailable
          or rate-limited.
        </li>
      </ul>

      <p>
        Your text leaves our infrastructure when this happens, and what those
        providers do with it is governed by their own terms, not ours. Neither
        provider is given your email address or account identity — only the text
        needed for that one request. If you are not comfortable with a resume
        being processed this way, do not upload it: the application tracker,
        Vault and export features work without ever calling an AI model.
      </p>

      <h2 id="basis">Why we are allowed to process it</h2>

      <p>
        Where the UK or EU GDPR applies, our legal bases are <em>contract</em> —
        we cannot provide an account, store your Vault or generate a tailored
        resume without processing this data — and <em>legitimate interests</em>{" "}
        for keeping the service secure, enforcing the daily limit, and counting
        page views in aggregate. Where India&apos;s Digital Personal Data
        Protection Act 2023 applies, processing rests on the consent you give by
        creating an account and submitting content, which you can withdraw at any
        time by deleting your account.
      </p>

      <h2 id="processors">Who else handles your data</h2>

      <ul>
        <li>
          <strong>Supabase</strong> — authentication, database and file storage.
        </li>
        <li>
          <strong>Vercel</strong> — application hosting and cookieless analytics.
        </li>
        <li>
          <strong>Google</strong> and <strong>Groq</strong> — AI processing, as
          described above.
        </li>
      </ul>

      <p>
        These providers operate internationally, so your data may be processed
        outside your own country, including in the United States. Each publishes
        its own privacy terms and transfer safeguards. Nobody else receives your
        data, and it is never sold.
      </p>

      <h2 id="sharing">Resume links you publish yourself</h2>

      <p>
        You can publish a tailored resume at a share link. Anyone holding that
        link can read it without signing in — that is the point of it. The page
        asks search engines not to index it, and the link is a random identifier,
        but treat a published resume as public. You can unpublish it at any time
        from the Tailored Resumes page.
      </p>

      <h2 id="retention">How long it is kept</h2>

      <p>
        Until you delete it. There is no automatic expiry, because a Vault you
        wrote two years ago is still the thing that makes the product useful.
        Deleting an individual resume removes both its database row and the
        stored file. Deleting your account removes your profile, resumes,
        uploaded files, Vault, analyses, applications, cover letters, interview
        sessions and sign-in record.
      </p>

      <p>
        Two honest caveats: backups held by our hosting providers may retain a
        copy for a short period before rotating out, and server error logs may
        briefly contain technical details of a failed request.
      </p>

      <h2 id="rights">Your rights, and how to actually use them</h2>

      <p>
        You do not need to email anyone for the two that matter most — both are
        buttons in <Link href="/dashboard/settings">Settings</Link>:
      </p>

      <dl>
        <dt>Access and portability</dt>
        <dd>
          <strong>Export my data</strong> downloads everything we hold about you
          as a JSON file.
        </dd>
        <dt>Erasure</dt>
        <dd>
          <strong>Delete account</strong> permanently removes your account and
          everything in it. It cannot be undone.
        </dd>
        <dt>Rectification</dt>
        <dd>
          Edit your profile in Settings, and your content wherever you created
          it.
        </dd>
        <dt>Objection, restriction, and withdrawal of consent</dt>
        <dd>
          Email <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
          Deleting your account also withdraws consent entirely.
        </dd>
        <dt>Complaint</dt>
        <dd>
          You can complain to your local supervisory authority — the Data
          Protection Board of India, or your national data protection authority
          in the UK or EU.
        </dd>
      </dl>

      <p>Requests sent by email are answered within 30 days.</p>

      <h2 id="children">Children</h2>

      <p>
        {SITE.name} is meant for people looking for work and is not directed at
        children. Do not create an account if you are under 18. If you believe a
        child has given us personal data, email us and it will be deleted.
      </p>

      <h2 id="security">Security</h2>

      <p>
        Traffic is served over HTTPS. Passwords are hashed by Supabase and never
        seen by this application. Uploaded files live in a private bucket that is
        not publicly readable. Every database query is scoped to the signed-in
        account. No system is perfectly secure, and this one is maintained by one
        person — if you find a problem, please report it to{" "}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a> rather
        than disclosing it publicly.
      </p>

      <h2 id="changes">Changes</h2>

      <p>
        If this policy changes materially, the date at the top changes and the
        previous version stays in the{" "}
        <a href={SITE.repoUrl}>public git history</a>.
      </p>
    </>
  );
}
