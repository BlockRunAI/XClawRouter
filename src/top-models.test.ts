import { describe, expect, it } from "vitest";

import { BLOCKRUN_MODELS } from "./models.js";
import topModelsJson from "./top-models.json";
import { TOP_MODELS } from "./top-models.js";

/**
 * Free ids that must never return to the picker or the auto-pick cascade.
 *
 * Every one of these was still being advertised on 2026-08-31, months after it
 * died, because nothing checked. They do not fail loudly: blockrun hides a
 * retired free id and server-redirects the call, so the user gets an answer
 * from a different model and `/exclude` on the id they can see does nothing.
 *
 * Append on every retirement. The entries may stay in BLOCKRUN_MODELS so an
 * explicit pin keeps resolving — this guard is about user-facing surfaces.
 */
const RETIRED_FREE_IDS = [
  "free/gpt-oss-120b", // dead upstream 2026-08-16; withheld over NVIDIA prompt-retention terms
  "free/gpt-oss-20b", // same
  "free/deepseek-v4-flash", // 410 Gone at NVIDIA 2026-08-12 (blockrun #367)
  "free/qwen3-coder-480b", // NVIDIA EOL 2026-06-14
  "free/glm-4.7", // NIM hung, server-redirected to qwen3-coder
  "free/llama-4-maverick", // dropped from the live catalog 2026-07-17
  "free/mistral-large-3-675b", // 410 Gone in blockrun's 2026-07-28 re-probe
  "free/seed-oss-36b", // NVIDIA sweep 2026-08-30
  "free/mistral-nemotron", // NVIDIA sweep 2026-08-30 (hung, not 410)
  "free/step-3.7-flash", // NVIDIA sweep 2026-08-30
  "free/nemotron-nano-9b-v2", // NVIDIA sweep 2026-08-30
  "free/nemotron-nano-12b-v2-vl", // NVIDIA sweep 2026-08-30
] as const;

/** The live free tier as of the 2026-08-31 rebuild, in auto-pick order. */
const LIVE_FREE_IDS = [
  "free/nemotron-3.5-lightning",
  "free/nemotron-3-nano-30b",
  "free/laguna-xs-2.1",
  "free/north-mini-code",
  "free/nemotron-3-nano-omni-30b-a3b-reasoning",
  "free/nemotron-3-ultra-550b",
  "free/llama-3.2-11b-vision",
] as const;

describe("TOP_MODELS", () => {
  it("loads the shared curated allowlist from top-models.json", () => {
    expect(TOP_MODELS).toEqual(topModelsJson);
    expect(new Set(TOP_MODELS).size).toBe(TOP_MODELS.length);
    expect(TOP_MODELS).toContain("openai/gpt-5.5");
    expect(TOP_MODELS).toContain("xai/grok-4-0709");
    expect(TOP_MODELS).toContain("deepseek/deepseek-reasoner");
  });

  it("advertises no retired free model", () => {
    const resurrected = RETIRED_FREE_IDS.filter((id) => TOP_MODELS.includes(id));
    expect(resurrected).toEqual([]);
  });

  it("advertises the live free tier, contiguously at the end and in cascade order", () => {
    const freeTail = TOP_MODELS.filter((id) => id.startsWith("free/"));
    expect(freeTail).toEqual([...LIVE_FREE_IDS]);
    expect(TOP_MODELS.slice(-freeTail.length)).toEqual(freeTail);
  });

  it("defines every advertised model, so no picker entry is a phantom id", () => {
    const defined = new Set(BLOCKRUN_MODELS.map((m) => m.id));
    const phantom = TOP_MODELS.filter((id) => !defined.has(id));
    expect(phantom).toEqual([]);
  });
});
