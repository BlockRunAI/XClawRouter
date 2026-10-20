import { describe, expect, it } from "vitest";

import { BLOCKRUN_MODELS, MODEL_ALIASES, resolveModelAlias } from "./models.js";
import { TOP_MODELS } from "./top-models.js";

describe("resolveModelAlias", () => {
  it("maps Claude aliases to current flagship versions", () => {
    // Sonnet → 4.6, Opus → 4.7 (new flagship), Haiku → 4.5
    expect(resolveModelAlias("claude")).toBe("anthropic/claude-sonnet-4.6");
    expect(resolveModelAlias("br-sonnet")).toBe("anthropic/claude-sonnet-4.6");
    expect(resolveModelAlias("sonnet")).toBe("anthropic/claude-sonnet-4.6");
    expect(resolveModelAlias("opus")).toBe("anthropic/claude-opus-4.8");
    expect(resolveModelAlias("haiku")).toBe("anthropic/claude-haiku-4.5");
  });

  it("maps gpt5 shorthand to the newest GPT-5 flagship", () => {
    expect(resolveModelAlias("gpt5")).toBe("openai/gpt-5.5");
  });

  it("resolves aliases even when sent with blockrun/ prefix", () => {
    expect(resolveModelAlias("blockrun/claude")).toBe("anthropic/claude-sonnet-4.6");
    expect(resolveModelAlias("blockrun/sonnet-4.6")).toBe("anthropic/claude-sonnet-4.6");
    expect(resolveModelAlias("blockrun/opus")).toBe("anthropic/claude-opus-4.8");
  });

  it("keeps explicit version pins routable, promotes generic opus-4 to flagship 4.8", () => {
    expect(resolveModelAlias("anthropic/claude-sonnet-4")).toBe("anthropic/claude-sonnet-4.6");
    expect(resolveModelAlias("anthropic/claude-opus-4")).toBe("anthropic/claude-opus-4.8");
    // 4.5 is a distinct model in blockrun (200K context, smaller than 4.6/4.7's 1M);
    // the explicit pin must be preserved end-to-end, not silently upgraded.
    expect(resolveModelAlias("anthropic/claude-opus-4.5")).toBe("anthropic/claude-opus-4.5");
    expect(resolveModelAlias("anthropic/claude-opus-4-5")).toBe("anthropic/claude-opus-4.5");
    expect(resolveModelAlias("anthropic/claude-opus-4-6")).toBe("anthropic/claude-opus-4.6");
  });

  it("strips openai/ prefix from virtual routing profiles (issue #78)", () => {
    // OpenClaw sends virtual profiles as "openai/eco", "openai/auto", etc.
    expect(resolveModelAlias("openai/eco")).toBe("eco");
    expect(resolveModelAlias("openai/free")).toBe("free/nemotron-3.5-lightning"); // "free" is now an alias, not a virtual profile
    expect(resolveModelAlias("openai/auto")).toBe("auto");
    expect(resolveModelAlias("openai/premium")).toBe("premium");
  });

  it("strips openai/ prefix from aliases", () => {
    expect(resolveModelAlias("openai/claude")).toBe("anthropic/claude-sonnet-4.6");
    expect(resolveModelAlias("openai/sonnet")).toBe("anthropic/claude-sonnet-4.6");
  });

  it("redirects delisted grok-code-fast-1 IDs to deepseek", () => {
    expect(resolveModelAlias("xai/grok-code-fast-1")).toBe("deepseek/deepseek-chat");
    expect(resolveModelAlias("blockrun/xai/grok-code-fast-1")).toBe("deepseek/deepseek-chat");
    expect(resolveModelAlias("grok-code-fast-1")).toBe("deepseek/deepseek-chat");
  });
});

describe("2026-10-20 live catalog sync", () => {
  // Rates, context and max output from blockrun.ai/api/v1/models on 2026-10-20.
  const added: Array<[string, number, number, number, number]> = [
    ["openai/gpt-6.1-sol", 2, 10, 1_050_000, 128_000],
    ["openai/gpt-5.6-sol-pro", 4, 20, 1_050_000, 128_000],
    ["openai/gpt-5.6-terra-pro", 2, 12, 1_050_000, 128_000],
    ["openai/gpt-5.6-luna-pro", 0.2, 1.2, 1_050_000, 128_000],
    ["openai/chat-latest", 5, 30, 128_000, 128_000],
    ["anthropic/claude-sonnet-4.5", 3, 15, 200_000, 64_000],
    ["google/gemini-3.8-flash", 0.75, 3.75, 1_048_576, 65_536],
    ["qwen/qwen3.8-max", 2, 6, 1_000_000, 131_072],
    ["qwen/qwen3.7-plus", 0.32, 1.28, 1_000_000, 131_072],
    ["qwen/qwen3.7-flash", 0.03, 0.13, 1_000_000, 65_536],
    ["tencent/hy4-preview", 0.834, 2.501, 1_048_576, 64_000],
    ["mistral/mistral-large-4", 0.68, 2.09, 524_288, 262_144],
    ["poolside/laguna-s-2.1", 0.09, 0.18, 1_048_576, 131_072],
    ["free/muse-glimmer-30b", 0, 0, 131_072, 16_384],
  ];

  it.each(added)("carries %s at gateway pricing", (id, input, output, ctx, maxOut) => {
    const m = BLOCKRUN_MODELS.find((x) => x.id === id);
    expect(m).toMatchObject({
      inputPrice: input,
      outputPrice: output,
      contextWindow: ctx,
      maxOutput: maxOut,
    });
    expect(m?.deprecated).toBeUndefined();
    expect(resolveModelAlias(id)).toBe(id);
    expect(TOP_MODELS).toContain(id);
  });

  it("corrects context and max output to the gateway's", () => {
    const pick = (id: string) => BLOCKRUN_MODELS.find((m) => m.id === id);
    expect(pick("anthropic/claude-sonnet-4.6")).toMatchObject({
      contextWindow: 1_000_000,
      maxOutput: 128_000,
    });
    expect(pick("openai/gpt-5.4")).toMatchObject({ contextWindow: 1_050_000 });
    expect(pick("anthropic/claude-haiku-4.5")).toMatchObject({ maxOutput: 64_000 });
    expect(pick("deepseek/deepseek-chat")).toMatchObject({
      contextWindow: 1_048_576,
      maxOutput: 65_536,
    });
  });

  it("marks the ids the gateway retired with its own redirect target", () => {
    const retired: Record<string, string> = {
      "openai/gpt-5.3": "openai/gpt-5.2",
      "xai/grok-3": "xai/grok-4-1-fast-non-reasoning",
      "xai/grok-3-mini": "xai/grok-4-1-fast-non-reasoning",
      "xai/grok-4-fast-reasoning": "xai/grok-4-1-fast-reasoning",
      "xai/grok-4-fast-non-reasoning": "xai/grok-4-1-fast-non-reasoning",
      "xai/grok-2-vision": "xai/grok-4.3",
      "tencent/hy3": "qwen/qwen3.7-flash",
    };
    for (const [id, fallbackModel] of Object.entries(retired)) {
      expect(
        BLOCKRUN_MODELS.find((m) => m.id === id),
        id,
      ).toMatchObject({ deprecated: true, fallbackModel });
    }
    expect(resolveModelAlias("grok-fast")).toBe("xai/grok-4-1-fast-reasoning");
  });

  it("lands no generic free shorthand on a retired free model", () => {
    const dead = new Set([
      "free/gpt-oss-120b",
      "free/deepseek-v4-flash",
      "free/qwen3-coder-480b",
      "free/glm-4.7",
      "free/llama-4-maverick",
    ]);
    // Only pins that NAME the dead model may still point at it — the gateway
    // redirects those. Everything else must land on a live model.
    const namingPins = new Set([
      "gpt-120b",
      "nvidia/gpt-oss-120b",
      "deepseek-v4-flash",
      "v4-flash",
      "nvidia/deepseek-v4-flash",
      "nvidia/qwen3-coder-480b",
      "qwen/qwen3-coder-480b-a35b-instruct",
      "nvidia/glm-4.7",
      "nvidia/llama-4-maverick",
      "maverick",
    ]);
    const generic = Object.entries(MODEL_ALIASES).filter(
      ([alias, target]) => dead.has(target) && !namingPins.has(alias),
    );
    expect(generic).toEqual([]);
    expect(resolveModelAlias("free")).toBe("free/nemotron-3.5-lightning");
    expect(resolveModelAlias("nemotron")).toBe("free/nemotron-3.5-lightning");
    expect(resolveModelAlias("llama-free")).toBe("free/llama-3.2-11b-vision");
  });

  it("points no image alias at a delisted or uncatalogued model", () => {
    expect(resolveModelAlias("dalle")).toBe("openai/gpt-image-2");
    expect(resolveModelAlias("flux")).toBe("flux");
    expect(Object.values(MODEL_ALIASES)).not.toContain("openai/dall-e-3");
    expect(Object.values(MODEL_ALIASES)).not.toContain("black-forest/flux-1.1-pro");
  });
});
