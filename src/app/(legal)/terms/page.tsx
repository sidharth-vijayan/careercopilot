import type { Metadata } from "next";
import Link from "next/link";

import { DAILY_AI_LIMIT } from "@/lib/quota";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use | Recut",
  description:
    "The terms you agree to by using Recut: fair use, AI output, your content, refunds and liability.",
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Use</h1>
      <p className="text-sm">Last updated: {SITE.policyUpdated}</p>

      <p>
        {SITE.name} is operated by {SITE.operator}, {SITE.operatorType}, in{" "}
        {SITE.location}. By creating an account or using the demo you agree to
        these terms. If you do not agree, please do not use the service. Contact:{" "}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>

      <h2 id="what">What Recut is</h2>

      <p>
        A writing tool. You store your experience once, and it uses AI models to
        re-cut that material against a job description, score it, and draft cover
        letters and interview answers.
      </p>

      <p>
        It is not a recruitment agency, employment service, career counsellor or
        legal adviser. It does not submit applications on your behalf, has no
        relationship with any employer or applicant tracking system, and cannot
        promise you an interview, a job, or that any particular resume will pass
        any particular screening tool. Scores and match percentages it shows are
        the output of a language model, not a measurement of what a real employer
        will do.
      </p>

      <h2 id="eligibility">Eligibility</h2>

      <p>
        You must be at least 18 years old and able to enter a binding agreement.
        One account per person. Provide a real email address — it is the only way
        to recover access.
      </p>

      <h2 id="limits">Free access and fair use</h2>

      <p>
        {SITE.name} is free. There is no paid tier, no trial, and no credit card
        anywhere in the product.
      </p>

      <p>
        It is free because the AI calls run on the operator&apos;s own API keys,
        which is also why there is a limit: each account gets{" "}
        <strong>{DAILY_AI_LIMIT} AI generations per day</strong>, resetting at
        midnight UTC. An analysis, a bullet rewrite, a cover letter, a tailored
        resume, an interview question set and an answer review each use one. You
        can see how many you have left in Settings.
      </p>

      <p>
        That limit can change without notice if costs or abuse make it necessary,
        and the service can be slowed, suspended or shut down at any time. Please
        do not treat {SITE.name} as the only copy of anything important — use the
        export buttons.
      </p>

      <h2 id="acceptable">Acceptable use</h2>

      <p>You agree not to:</p>

      <ul>
        <li>
          upload resumes, personal data or content belonging to someone else
          without their permission;
        </li>
        <li>
          use it to create knowingly false claims about qualifications,
          employment history, education or credentials;
        </li>
        <li>
          upload anything unlawful, malicious, or infringing someone else&apos;s
          copyright;
        </li>
        <li>
          script, scrape or otherwise automate the service, or try to get around
          the daily limit with multiple accounts;
        </li>
        <li>
          probe, attack or attempt to access another account&apos;s data. If you
          find a security flaw, report it to{" "}
          <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
        </li>
      </ul>

      <h2 id="ai-output">AI output is a draft, and you are responsible for it</h2>

      <p>
        Everything the AI produces is a suggestion. Language models get things
        wrong — they invent specifics, overstate results, and sometimes rewrite a
        modest achievement into a bolder one than the facts support.
      </p>

      <p>
        <strong>Read every line before you send it to an employer.</strong> You
        are responsible for the accuracy of anything you submit under your own
        name, and misrepresenting your experience to an employer can cost you the
        role or the job. {SITE.name} gives you no defence for a claim you did not
        check.
      </p>

      <h2 id="content">Your content</h2>

      <p>
        Your resumes, Vault entries and everything you write stay yours. You give{" "}
        {SITE.name} only the permission needed to run the service for you: to
        store that content, and to send the relevant parts to the AI providers
        named in the <Link href="/privacy#ai">Privacy Policy</Link> so a request
        can be answered. That permission ends when you delete the content or your
        account. Your content is never used to train any model by us, and it is
        never sold or published except through a share link you create yourself.
      </p>

      <h2 id="demo">The demo account</h2>

      <p>
        The demo is a shared, read-only account so that people can look around
        without signing up. It is public: do not put anything real or private
        into it, because anyone else can open the same account and see it. Writes
        are blocked, so nothing you type there is saved.
      </p>

      <h2 id="refunds">Refunds and cancellation</h2>

      <p>
        <strong>
          {SITE.name} does not charge for anything, so there is nothing to refund.
        </strong>{" "}
        No payment method is collected, no subscription exists, and no charge can
        be made to you by this service.
      </p>

      <p>
        You can cancel at any time by deleting your account in{" "}
        <Link href="/dashboard/settings">Settings</Link>, which removes your data
        immediately and permanently. No notice period, no cancellation fee,
        nothing to claim back.
      </p>

      <p>
        If a paid plan is ever introduced, these terms will be updated with a
        real refund policy before any charge is taken, and no existing account
        will be charged without agreeing to it first. If you ever receive a
        payment request claiming to be from {SITE.name}, it is not from us —
        please report it to{" "}
        <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>

      <h2 id="availability">Availability</h2>

      <p>
        This is a personal project hosted on free and low-cost infrastructure.
        There is no uptime guarantee, no support commitment and no backup
        guarantee. Features may change or be removed. The service may be
        discontinued entirely, in which case reasonable effort will be made to
        give notice on the site so you can export your data first.
      </p>

      <h2 id="termination">Suspension and termination</h2>

      <p>
        You may delete your account at any time. We may suspend or delete an
        account that breaks these terms, abuses the AI quota, or puts the service
        or other users at risk — normally with notice by email, and immediately
        where the problem is serious.
      </p>

      <h2 id="warranty">No warranty</h2>

      <p>
        The service is provided &quot;as is&quot; and &quot;as available&quot;,
        without warranties of any kind, express or implied, including
        merchantability, fitness for a particular purpose and non-infringement.
        No advice or information obtained through the service creates any
        warranty not stated here.
      </p>

      <h2 id="liability">Limitation of liability</h2>

      <p>
        To the fullest extent permitted by law, {SITE.operator} is not liable for
        any indirect, incidental, special or consequential loss, or for lost
        opportunities, lost employment, lost data, or loss arising from
        inaccurate AI output, and total liability for any claim relating to the
        service is limited to the amount you paid for it — which is zero.
      </p>

      <p>
        Nothing in these terms excludes liability that cannot be excluded by law,
        including liability for fraud, or for death or personal injury caused by
        negligence. Some jurisdictions do not allow certain exclusions, so parts
        of this section may not apply to you; your statutory consumer rights are
        unaffected.
      </p>

      <h2 id="thirdparty">Third-party links and job postings</h2>

      <p>
        You can import a job description from a URL. {SITE.name} fetches that
        page&apos;s text for you and has no control over, and takes no
        responsibility for, its content or accuracy. Respect the terms of any job
        board you import from.
      </p>

      <h2 id="law">Governing law</h2>

      <p>
        These terms are governed by the laws of {SITE.country}, and the courts
        at {SITE.courts} have exclusive jurisdiction, except where mandatory
        consumer-protection law in your country of residence gives you the right
        to bring a claim locally.
      </p>

      <h2 id="changes">Changes to these terms</h2>

      <p>
        These terms may be updated; the date at the top changes when they are,
        and every prior version is in the{" "}
        <a href={SITE.repoUrl}>public git history</a>. Continuing to use the
        service after a change means you accept it. If a change is material, the
        change will be announced in the app.
      </p>
    </>
  );
}
