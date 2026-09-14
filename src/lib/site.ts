/**
 * Business and contact details shown on the legal pages and in the footer.
 *
 * Consumer-protection and data-protection rules both expect a real, reachable
 * operator behind a public site, so this is deliberately one place rather than
 * a string repeated across four pages.
 *
 * CHANGE `CONTACT_EMAIL` before deploying if you would rather publish a
 * different address — it is the address data-rights requests arrive at.
 */
export const SITE = {
  name: "Recut",
  /** Operator. A solo project, not an incorporated company — say so plainly. */
  operator: "Sidharth Vijayan",
  operatorType: "an individual developer (sole operator, not a registered company)",
  /** Where the operator is. Used for "based in" copy. */
  location: "Pune, Maharashtra, India",
  /** Governing law, and the seat of the courts named in the Terms. */
  country: "India",
  courts: "Pune, Maharashtra",
  contactEmail: "sidharthclt12@gmail.com",
  repoUrl: "https://github.com/sidharth-vijayan/recut",
  /** Last substantive review of the legal pages. Bump when you edit them. */
  policyUpdated: "14 September 2026",
} as const;
