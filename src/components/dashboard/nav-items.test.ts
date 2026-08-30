import { describe, expect, it } from "vitest";

import {
  ALL_NAV_ITEMS,
  PRIMARY_NAV_ITEMS,
  isNavItemActive,
} from "@/components/dashboard/nav-items";

describe("isNavItemActive", () => {
  it("matches the dashboard index only exactly", () => {
    // "/dashboard" is a prefix of every other route, so a naive startsWith
    // check would light up Overview on every page.
    expect(isNavItemActive("/dashboard", "/dashboard")).toBe(true);
    expect(isNavItemActive("/dashboard", "/dashboard/vault")).toBe(false);
  });

  it("matches a child route by prefix", () => {
    expect(isNavItemActive("/dashboard/vault", "/dashboard/vault")).toBe(true);
    expect(isNavItemActive("/dashboard/vault", "/dashboard/vault/123")).toBe(true);
  });

  it("does not match a sibling with a shared prefix", () => {
    // "/dashboard/tailor" must not activate for "/dashboard/tailored".
    expect(isNavItemActive("/dashboard/tailor", "/dashboard/tailored")).toBe(false);
  });
});

describe("navigation config", () => {
  it("has no duplicate hrefs", () => {
    const hrefs = ALL_NAV_ITEMS.map((i) => i.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("keeps the mobile bottom bar at exactly five items", () => {
    // The bar is a five-column grid; more or fewer breaks the layout.
    expect(PRIMARY_NAV_ITEMS).toHaveLength(5);
  });
});
