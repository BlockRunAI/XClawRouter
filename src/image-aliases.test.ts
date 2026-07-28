/**
 * Every image alias must point at a model this proxy can actually price.
 *
 * Two of them did not, and both failed the call rather than degrading:
 *
 *   --model flux   -> black-forest/flux-1.1-pro, absent from the gateway catalog
 *   --model dalle  -> openai/dall-e-3, delisted upstream (available:false)
 *
 * and the DEFAULT for an unqualified image request was the second one, so any
 * request that did not name a model failed too.
 *
 * The invariant checkable offline is that an alias target is priced here: a
 * model this repo cannot price is one it does not really support. That catches
 * the flux case at the point someone adds it.
 *
 * It cannot catch "priced but retired upstream" — availability lives in the
 * gateway catalog, not here. That one is caught by blockrun's own model tests,
 * which is where the catalog is.
 */
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const source = readFileSync("src/proxy.ts", "utf8");

/** Pull a `Record<string, string>` alias literal out of the proxy source. */
function aliasTargets(name: string): string[] {
  const start = source.indexOf(`const ${name}: Record<string, string> = {`);
  expect(start, `${name} not found — has it been renamed?`).toBeGreaterThan(-1);
  const body = source.slice(start, source.indexOf("};", start));
  return [...body.matchAll(/:\s*"([^"]+)"/g)].map((m) => m[1]);
}

/** Model ids the pricing table knows how to charge for. */
const priced = new Set(
  [...source.matchAll(/^\s{2}"([a-z0-9-]+\/[a-z0-9.-]+)":\s*\{/gim)].map((m) => m[1]),
);

describe("image model aliases", () => {
  it("finds a pricing table to check against", () => {
    expect(priced.size).toBeGreaterThan(3);
  });

  it.each([["IMAGE_MODEL_ALIASES"], ["IMG2IMG_ALIASES"]])("%s targets are all priced", (name) => {
    const unpriced = aliasTargets(name).filter((t) => !priced.has(t));
    expect(unpriced, `unpriced alias target(s) — this proxy cannot charge for them`).toEqual([]);
  });

  it("does not route anything to the delisted dall-e-3", () => {
    // Kept as an alias KEY so existing scripts keep working; it must never be
    // a TARGET again.
    expect(aliasTargets("IMAGE_MODEL_ALIASES")).not.toContain("openai/dall-e-3");
  });

  it("defaults unqualified image requests to a model it can price", () => {
    const fallback = source.match(/imgModel = parsed\.model \|\| "([^"]+)"/)?.[1];
    expect(fallback, "the default image model literal moved").toBeTruthy();
    expect(priced.has(fallback!), `default ${fallback} is not priced`).toBe(true);
  });
});
