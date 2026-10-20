/**
 * BlockRun Model Definitions for OpenClaw
 *
 * Maps BlockRun's model catalog to OpenClaw's ModelDefinitionConfig format.
 * All models use the "openai-completions" API since BlockRun is OpenAI-compatible.
 *
 * Pricing is in USD per 1M tokens. Operators pay these rates via x402;
 * they set their own markup when reselling to end users (Phase 2).
 */

import type { ModelDefinitionConfig, ModelProviderConfig } from "./types.js";

/**
 * Model aliases for convenient shorthand access.
 * Users can type `/model claude` instead of `/model blockrun/anthropic/claude-sonnet-4-6`.
 */
export const MODEL_ALIASES: Record<string, string> = {
  // Claude - flagship opus is 4.7; sonnet stays at 4.6
  claude: "anthropic/claude-sonnet-4.6",
  "br-sonnet": "anthropic/claude-sonnet-4.6",
  sonnet: "anthropic/claude-sonnet-4.6",
  "sonnet-4": "anthropic/claude-sonnet-4.6",
  "sonnet-4.6": "anthropic/claude-sonnet-4.6",
  "sonnet-4-6": "anthropic/claude-sonnet-4.6",
  opus: "anthropic/claude-opus-4.8",
  "opus-4": "anthropic/claude-opus-4.8",
  "opus-4.8": "anthropic/claude-opus-4.8",
  "opus-4-8": "anthropic/claude-opus-4.8",
  "anthropic/claude-opus-4-8": "anthropic/claude-opus-4.8",
  "anthropic/claude-fable-5-1": "anthropic/claude-fable-5.1",
  "anthropic/claude-opus-5-5": "anthropic/claude-opus-5.5",
  "anthropic/claude-sonnet-5-5": "anthropic/claude-sonnet-5.5",
  "opus-4.7": "anthropic/claude-opus-4.7",
  "opus-4-7": "anthropic/claude-opus-4.7",
  "opus-4.6": "anthropic/claude-opus-4.6",
  "opus-4-6": "anthropic/claude-opus-4.6",
  haiku: "anthropic/claude-haiku-4.5",
  // Claude - provider/shortname patterns (common in agent frameworks)
  "anthropic/sonnet": "anthropic/claude-sonnet-4.6",
  "anthropic/opus": "anthropic/claude-opus-4.8",
  "anthropic/haiku": "anthropic/claude-haiku-4.5",
  "anthropic/claude": "anthropic/claude-sonnet-4.6",
  // Backward compatibility - generic opus-4 and older flagships point at 4.7;
  // explicit version pins (claude-opus-4-6) stay on 4.6 since server still routes it.
  "anthropic/claude-sonnet-4": "anthropic/claude-sonnet-4.6",
  "anthropic/claude-sonnet-4-6": "anthropic/claude-sonnet-4.6",
  "anthropic/claude-opus-4": "anthropic/claude-opus-4.8",
  "anthropic/claude-opus-4-7": "anthropic/claude-opus-4.7",
  "anthropic/claude-opus-4-6": "anthropic/claude-opus-4.6",
  "anthropic/claude-opus-4-5": "anthropic/claude-opus-4.5",
  "anthropic/claude-haiku-4": "anthropic/claude-haiku-4.5",
  "anthropic/claude-haiku-4-5": "anthropic/claude-haiku-4.5",

  // OpenAI
  gpt: "openai/gpt-4o",
  gpt4: "openai/gpt-4o",
  gpt5: "openai/gpt-5.5",
  "gpt-5.5": "openai/gpt-5.5",
  "gpt-5.4": "openai/gpt-5.4",
  "gpt-5.4-pro": "openai/gpt-5.4-pro",
  "gpt-5.4-nano": "openai/gpt-5.4-nano",
  nano: "openai/gpt-5.4-nano",
  "gpt-5-nano": "openai/gpt-5.4-nano",
  codex: "openai/gpt-5.3-codex",
  mini: "openai/gpt-4o-mini",
  o1: "openai/o1",
  // o1-mini delisted by OpenAI 2026-06-06 — mirror the gateway redirect.
  "openai/o1-mini": "openai/o4-mini",
  "o1-mini": "openai/o4-mini",
  o3: "openai/o3",
  // OpenAI Codex prefix aliases (OpenClaw v2026.4.5 openai-codex/ model ID format)
  "openai-codex/gpt-5.4-mini": "openai/gpt-5.4-mini",
  "gpt-5.4-mini": "openai/gpt-5.4-mini",

  // DeepSeek
  deepseek: "deepseek/deepseek-chat",
  "deepseek-chat": "deepseek/deepseek-chat",
  reasoner: "deepseek/deepseek-reasoner",

  // Kimi / Moonshot — K2.6 is the featured flagship on BlockRun (K2.5 hidden in
  // BlockRun's UI 2026-04-28). Bare aliases now resolve to K2.6. Users who
  // explicitly pinned "kimi-k2.5" continue to get K2.5 (cost-stability opt-in:
  // $0.60/$3.00 vs K2.6's $0.95/$4.00). NVIDIA-hosted K2.5 was retired 2026-04-21.
  // 2026-08-31: K2.6 and K2.5 are both off the live catalog; the bare aliases
  // follow the current flagship, K3. Explicit "kimi-k2.6"/"kimi-k2.5" pins keep
  // resolving to those exact ids.
  kimi: "moonshot/kimi-k3",
  moonshot: "moonshot/kimi-k3",
  "kimi-k2": "moonshot/kimi-k3",
  "kimi-k2.6": "moonshot/kimi-k2.6",
  "kimi-k2.5": "moonshot/kimi-k2.5",
  "nvidia/kimi-k2.5": "moonshot/kimi-k2.5",

  // Google
  // gemini-3-pro-preview delisted by Google 2026-06-06 — mirror the gateway
  // redirect to its successor so pinned callers land on 3.1-pro, not an error.
  "google/gemini-3-pro-preview": "google/gemini-3.1-pro",
  "gemini-3-pro-preview": "google/gemini-3.1-pro",
  gemini: "google/gemini-2.5-pro",
  flash: "google/gemini-2.5-flash",
  "gemini-3.1-pro-preview": "google/gemini-3.1-pro",
  "google/gemini-3.1-pro-preview": "google/gemini-3.1-pro",
  "gemini-3.5-flash": "google/gemini-3.5-flash",
  "gemini-3.1-flash-lite": "google/gemini-3.1-flash-lite",
  "gemini-2.5-flash-lite": "google/gemini-2.5-flash-lite",

  // xAI — grok-4.3 is the public flagship since 2026-06-04 (grok-3 and the
  // 4-fast/4-1-fast families are hidden in the backend catalog; direct full
  // IDs still resolve for pinned users).
  grok: "xai/grok-4.3",
  "grok-4.3": "xai/grok-4.3",
  // grok-4-fast-* are redirected server-side to grok-4-1-fast-* (Azure Foundry
  // EOL'd the 4-fast line); follow the redirect instead of chaining through it.
  "grok-fast": "xai/grok-4-1-fast-reasoning",
  "grok-build": "xai/grok-build-0.1",
  "grok-code": "xai/grok-build-0.1", // xAI's agentic coding model (Build 0.1, 2026-06-04)
  // Delisted model redirects — full model IDs that were previously valid but removed
  "grok-code-fast-1": "deepseek/deepseek-chat", // bare alias
  "xai/grok-code-fast-1": "deepseek/deepseek-chat", // delisted 2026-03-12
  "xai/grok-3-fast": "xai/grok-4-1-fast-reasoning", // delisted (too expensive); follows the 4-fast redirect

  // NVIDIA — backward compat aliases (nvidia/xxx → free/xxx)
  // Default free model is nemotron-3.5-lightning as of the 2026-08-31 rebuild;
  // gpt-oss-120b held this slot until it died upstream on 2026-08-16 (NVIDIA
  // then published its EOL on 2026-09-03; the gateway redirects it). The
  // model-specific aliases below still resolve to their original targets even
  // where those are retired — the entries stay in BLOCKRUN_MODELS so an
  // explicit pin keeps working; they are simply off the picker and the
  // auto-pick cascade. Retired-with-redirect entries mirror BlockRun's own
  // server-side decommissioning.
  nvidia: "free/nemotron-3.5-lightning",
  "gpt-120b": "free/gpt-oss-120b",
  "gpt-20b": "free/gpt-oss-20b",
  "nvidia/gpt-oss-120b": "free/gpt-oss-120b",
  "nvidia/gpt-oss-20b": "free/gpt-oss-20b",
  // The whole nvidia/deepseek-* family is dead upstream (v4-flash 410'd
  // 2026-08-12). Ids naming v4-flash itself keep the real id (the gateway
  // redirects them); v3.2/v4-pro used to chain through v4-flash and now land
  // on the live free default instead of a second dead model.
  "nvidia/deepseek-v3.2": "free/nemotron-3.5-lightning",
  "free/deepseek-v3.2": "free/nemotron-3.5-lightning",
  "nvidia/deepseek-v4-pro": "free/nemotron-3.5-lightning",
  "free/deepseek-v4-pro": "free/nemotron-3.5-lightning",
  "nvidia/deepseek-v4-flash": "free/deepseek-v4-flash",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning": "free/nemotron-3-nano-omni-30b-a3b-reasoning",
  "nvidia/qwen3-coder-480b": "free/qwen3-coder-480b",
  "qwen/qwen3-coder-480b-a35b-instruct": "free/qwen3-coder-480b",
  "nvidia/glm-4.7": "free/glm-4.7", // names the model itself — the gateway redirects it
  "nvidia/llama-4-maverick": "free/llama-4-maverick",
  // Retired free IDs that X never carried as catalog entries. These used to
  // point at llama-4-maverick / qwen3-coder-480b, both themselves dead upstream,
  // so every one of them chained through a second retired model (and silently
  // defeated /exclude). They now land on the live free default.
  "nvidia/qwen3-next-80b-a3b-thinking": "free/nemotron-3.5-lightning",
  "nvidia/mistral-small-4-119b": "free/nemotron-3.5-lightning",
  "nvidia/nemotron-ultra-253b": "free/nemotron-3.5-lightning",
  "nvidia/nemotron-3-super-120b": "free/nemotron-3.5-lightning",
  "nvidia/nemotron-super-49b": "free/nemotron-3.5-lightning",
  "nvidia/mistral-large-3-675b": "free/nemotron-3.5-lightning",
  "nvidia/devstral-2-123b": "free/nemotron-3.5-lightning",
  "free/nemotron-ultra-253b": "free/nemotron-3.5-lightning",
  "free/nemotron-3-super-120b": "free/nemotron-3.5-lightning",
  "free/nemotron-super-49b": "free/nemotron-3.5-lightning",
  "free/mistral-large-3-675b": "free/nemotron-3.5-lightning",
  "free/devstral-2-123b": "free/nemotron-3.5-lightning",
  // Free model shorthand aliases. Generic "a free X" shorthands follow the
  // live free tier (there is no free DeepSeek, Mistral, GLM or Qwen left on
  // NVIDIA); shorthands that NAME a model (v4-flash, maverick) keep the real id
  // and the gateway redirects them.
  "deepseek-free": "free/nemotron-3.5-lightning",
  "deepseek-v4-pro": "free/nemotron-3.5-lightning",
  "deepseek-v4-flash": "free/deepseek-v4-flash",
  "v4-pro": "free/nemotron-3.5-lightning",
  "v4-flash": "free/deepseek-v4-flash",
  "mistral-free": "free/nemotron-3.5-lightning",
  "glm-free": "free/nemotron-3.5-lightning",
  "llama-free": "free/llama-3.2-11b-vision", // the only free Llama NVIDIA still serves
  "qwen-coder": "free/nemotron-3.5-lightning",
  "qwen-coder-free": "free/nemotron-3.5-lightning",
  "qwen-thinking": "free/nemotron-3.5-lightning",
  "qwen3-next": "free/nemotron-3.5-lightning",
  "mistral-small": "free/nemotron-3.5-lightning",
  // Vision-capable free model — BlockRun's first
  "nemotron-omni": "free/nemotron-3-nano-omni-30b-a3b-reasoning",
  "nano-omni": "free/nemotron-3-nano-omni-30b-a3b-reasoning",
  "vision-free": "free/nemotron-3-nano-omni-30b-a3b-reasoning",
  // Retired shorthand aliases redirect to the live free default (they used to
  // name llama-4-maverick / qwen3-coder-480b, both dead upstream).
  nemotron: "free/nemotron-3.5-lightning",
  "nemotron-ultra": "free/nemotron-3.5-lightning",
  "nemotron-253b": "free/nemotron-3.5-lightning",
  "nemotron-super": "free/nemotron-3.5-lightning",
  "nemotron-49b": "free/nemotron-3.5-lightning",
  "nemotron-120b": "free/nemotron-3.5-lightning",
  devstral: "free/nemotron-3.5-lightning",
  "devstral-2": "free/nemotron-3.5-lightning",
  maverick: "free/llama-4-maverick",
  free: "free/nemotron-3.5-lightning",

  // MiniMax (minimax → current flagship: M3)
  minimax: "minimax/minimax-m3",
  "minimax-m3": "minimax/minimax-m3",
  "minimax-m2.7": "minimax/minimax-m2.7",
  "minimax-m2.5": "minimax/minimax-m2.5",

  // Z.AI GLM-5
  glm: "zai/glm-5.1",
  "glm-5": "zai/glm-5",
  "glm-5.1": "zai/glm-5.1",
  "glm-5-turbo": "zai/glm-5-turbo",

  // Routing profile aliases (common variations)
  "auto-router": "auto",
  router: "auto",

  // Note: auto, eco, premium are virtual routing profiles registered in BLOCKRUN_MODELS
  // They don't need aliases since they're already top-level model IDs

  // Image generation
  // dall-e-3 was delisted upstream 2026-05-25; the legacy aliases point at its
  // OpenAI successor. black-forest/flux-1.1-pro has no gateway entry at all, so
  // the flux aliases are gone rather than pointing at a guaranteed 400.
  dalle: "openai/gpt-image-2",
  "dall-e": "openai/gpt-image-2",
  "gpt-image": "openai/gpt-image-1",
  "gpt-image-2": "openai/gpt-image-2",
  "nano-banana": "google/nano-banana",
  banana: "google/nano-banana",
  "banana-pro": "google/nano-banana-pro",
  "nano-banana-pro": "google/nano-banana-pro",
  // Explicit pins — bare `nano-banana`/`grok-imagine` stay on the originals.
  "nano-banana-2": "google/nano-banana-2",
  "banana-2": "google/nano-banana-2",
  seedream: "bytedance/seedream-5-pro",
  "grok-imagine": "xai/grok-imagine-image",
  "grok-imagine-2": "xai/grok-imagine-image-2.0",
  "grok-imagine-pro": "xai/grok-imagine-image-pro",
  cogview: "zai/cogview-4",

  // Video generation
  "grok-video": "xai/grok-imagine-video",
  seedance: "bytedance/seedance-1.5-pro",
  "seedance-1.5": "bytedance/seedance-1.5-pro",
  "seedance-2-fast": "bytedance/seedance-2.0-fast",
  "seedance-2": "bytedance/seedance-2.0",
  // Bare `seedance` stays on 1.5-pro, the cheapest; newer tiers are explicit pins.
  "seedance-2-mini": "bytedance/seedance-2.0-mini",
  "seedance-mini": "bytedance/seedance-2.0-mini",
  "seedance-2.5": "bytedance/seedance-2.5",
  "seedance-2-5": "bytedance/seedance-2.5",
  "grok-video-1.5": "xai/grok-imagine-video-1.5",
};

/**
 * Resolve a model alias to its full model ID.
 * Also strips "blockrun/" prefix for direct model paths.
 * Examples:
 *   - "claude" -> "anthropic/claude-sonnet-4-6" (alias)
 *   - "blockrun/claude" -> "anthropic/claude-sonnet-4-6" (alias with prefix)
 *   - "blockrun/anthropic/claude-sonnet-4-6" -> "anthropic/claude-sonnet-4-6" (prefix stripped)
 *   - "openai/gpt-4o" -> "openai/gpt-4o" (unchanged)
 */
export function resolveModelAlias(model: string): string {
  const normalized = model.trim().toLowerCase();
  const resolved = MODEL_ALIASES[normalized];
  if (resolved) return resolved;

  // Check with "blockrun/" prefix stripped
  if (normalized.startsWith("blockrun/")) {
    const withoutPrefix = normalized.slice("blockrun/".length);
    const resolvedWithoutPrefix = MODEL_ALIASES[withoutPrefix];
    if (resolvedWithoutPrefix) return resolvedWithoutPrefix;

    // Even if not an alias, strip the prefix for direct model paths
    // e.g., "blockrun/anthropic/claude-sonnet-4-6" -> "anthropic/claude-sonnet-4-6"
    return withoutPrefix;
  }

  // Strip "openai/" prefix when it wraps a virtual routing profile or alias.
  // OpenClaw sends virtual models as "openai/eco", "openai/auto", etc. because
  // the provider uses the openai-completions API type.
  if (normalized.startsWith("openai/")) {
    const withoutPrefix = normalized.slice("openai/".length);
    const resolvedWithoutPrefix = MODEL_ALIASES[withoutPrefix];
    if (resolvedWithoutPrefix) return resolvedWithoutPrefix;

    // If it's a known BlockRun virtual profile (eco, auto, premium), return bare id
    const isVirtualProfile = BLOCKRUN_MODELS.some((m) => m.id === withoutPrefix);
    if (isVirtualProfile) return withoutPrefix;
  }

  // Strip "openai-codex/" prefix (OpenClaw v2026.4.5 model ID format).
  // e.g. "openai-codex/gpt-5.4-mini" -> check alias, then strip prefix.
  if (normalized.startsWith("openai-codex/")) {
    const withoutPrefix = normalized.slice("openai-codex/".length);
    const resolvedWithoutPrefix = MODEL_ALIASES[withoutPrefix];
    if (resolvedWithoutPrefix) return resolvedWithoutPrefix;

    // Fall back to checking if the bare name is a known model
    const isKnownModel = BLOCKRUN_MODELS.some((m) => m.id === withoutPrefix);
    if (isKnownModel) return withoutPrefix;
  }

  return model;
}

type BlockRunModel = {
  id: string;
  name: string;
  /** Model version (e.g., "4.6", "3.1", "5.2") for tracking updates */
  version?: string;
  inputPrice: number;
  outputPrice: number;
  contextWindow: number;
  maxOutput: number;
  reasoning?: boolean;
  vision?: boolean;
  /** Models optimized for agentic workflows (multi-step autonomous tasks) */
  agentic?: boolean;
  /**
   * Model supports OpenAI-compatible structured function/tool calling.
   * Models without this flag output tool invocations as plain text JSON,
   * which leaks raw {"command":"..."} into visible chat messages.
   * Default: false (must opt-in to prevent silent regressions on new models).
   */
  toolCalling?: boolean;
  /** Model is deprecated — will be routed to fallbackModel if set */
  deprecated?: boolean;
  /** Model ID to route to when this model is deprecated */
  fallbackModel?: string;
  /** Time-limited promotional pricing — auto-expires after endDate */
  promo?: {
    /** Flat price per request in USD (replaces token-based pricing) */
    flatPrice: number;
    /** ISO date, promo starts (inclusive). e.g. "2026-04-01" */
    startDate: string;
    /** ISO date, promo ends (exclusive). e.g. "2026-04-15" */
    endDate: string;
  };
  /**
   * Permanent flat per-request price in USD (backend billingMode: "flat").
   * Unlike promo, this never expires. Takes precedence over promo.
   */
  flatPrice?: number;
};

export const BLOCKRUN_MODELS: BlockRunModel[] = [
  // Smart routing meta-models — proxy replaces with actual model
  // NOTE: Model IDs are WITHOUT provider prefix (OpenClaw adds "blockrun/" automatically)
  {
    id: "auto",
    name: "Auto (Smart Router - Balanced)",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 1_050_000,
    maxOutput: 128_000,
  },
  {
    id: "free",
    name: "Free → Nemotron Ultra 253B",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 131_072,
    maxOutput: 16_384,
    reasoning: true,
  },
  {
    id: "eco",
    name: "Eco (Smart Router - Cost Optimized)",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 1_050_000,
    maxOutput: 128_000,
  },
  {
    id: "premium",
    name: "Premium (Smart Router - Best Quality)",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 2_000_000,
    maxOutput: 200_000,
  },

  // OpenAI GPT-5 Family
  {
    id: "openai/gpt-5.2",
    name: "GPT-5.2",
    version: "5.2",
    inputPrice: 1.75,
    outputPrice: 14.0,
    contextWindow: 400000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "openai/gpt-5-mini",
    name: "GPT-5 Mini",
    version: "5.0",
    inputPrice: 0.25,
    outputPrice: 2.0,
    contextWindow: 200000,
    maxOutput: 128000,
    toolCalling: true,
  },
  {
    id: "openai/gpt-5-nano",
    name: "GPT-5 Nano",
    version: "5.0",
    inputPrice: 0.05,
    outputPrice: 0.4,
    contextWindow: 128000,
    maxOutput: 32768,
    toolCalling: true,
    deprecated: true,
    fallbackModel: "openai/gpt-5.4-nano",
  },
  {
    id: "openai/gpt-5.2-pro",
    name: "GPT-5.2 Pro",
    version: "5.2",
    inputPrice: 21.0,
    outputPrice: 168.0,
    contextWindow: 400000,
    maxOutput: 128000,
    reasoning: true,
    toolCalling: true,
  },
  // GPT-5.5 — newest visible flagship in blockrun. First fully retrained base since
  // GPT-4.5; 1M+ context, native agent + computer use. Costs 2x gpt-5.4 — routing
  // tiers still default to gpt-5.4 because it's benchmarked; users can pin 5.5.
  {
    id: "openai/gpt-5.5",
    name: "GPT-5.5",
    version: "5.5",
    inputPrice: 5.0,
    outputPrice: 30.0,
    contextWindow: 1050000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  // GPT-5.4 — flagship benchmarked into routing tiers
  {
    id: "openai/gpt-5.4",
    name: "GPT-5.4",
    version: "5.4",
    inputPrice: 2.5,
    outputPrice: 15.0,
    contextWindow: 1050000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "openai/gpt-5.4-mini",
    name: "GPT-5.4 Mini",
    version: "5.4",
    inputPrice: 0.75,
    outputPrice: 4.5,
    contextWindow: 400000,
    maxOutput: 128000,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "openai/gpt-5.4-pro",
    name: "GPT-5.4 Pro",
    version: "5.4",
    inputPrice: 30.0,
    outputPrice: 180.0,
    contextWindow: 1050000,
    maxOutput: 128000,
    reasoning: true,
    toolCalling: true,
  },
  {
    id: "openai/gpt-5.4-nano",
    name: "GPT-5.4 Nano",
    version: "5.4",
    inputPrice: 0.2,
    outputPrice: 1.25,
    contextWindow: 1050000,
    maxOutput: 128000,
    toolCalling: true,
  },

  // OpenAI GPT-5.3 Family
  {
    id: "openai/gpt-5.3",
    name: "GPT-5.3",
    version: "5.3",
    inputPrice: 1.75,
    outputPrice: 14.0,
    contextWindow: 128000,
    maxOutput: 16000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
    // RETIRED 2026-08-29: OpenAI answers 404 model_not_found upstream. The
    // gateway marks it available:false and redirects it to gpt-5.2 at the same
    // $1.75/$14. Entry kept so explicit pins stay priced; off the picker.
    deprecated: true,
    fallbackModel: "openai/gpt-5.2",
  },

  // OpenAI Codex Family
  {
    id: "openai/gpt-5.3-codex",
    name: "GPT-5.3 Codex",
    version: "5.3",
    inputPrice: 1.75,
    outputPrice: 14.0,
    contextWindow: 400000,
    maxOutput: 128000,
    agentic: true,
    toolCalling: true,
  },

  // OpenAI GPT-4 Family
  {
    id: "openai/gpt-4.1",
    name: "GPT-4.1",
    version: "4.1",
    inputPrice: 2.0,
    outputPrice: 8.0,
    contextWindow: 128000,
    maxOutput: 32768,
    vision: true,
    toolCalling: true,
  },
  {
    id: "openai/gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    version: "4.1",
    inputPrice: 0.4,
    outputPrice: 1.6,
    contextWindow: 128000,
    maxOutput: 32768,
    toolCalling: true,
  },
  {
    id: "openai/gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    version: "4.1",
    inputPrice: 0.1,
    outputPrice: 0.4,
    contextWindow: 128000,
    maxOutput: 32768,
    toolCalling: true,
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    version: "4o",
    inputPrice: 2.5,
    outputPrice: 10.0,
    contextWindow: 128000,
    maxOutput: 16384,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    version: "4o-mini",
    inputPrice: 0.15,
    outputPrice: 0.6,
    contextWindow: 128000,
    maxOutput: 16384,
    toolCalling: true,
  },

  // OpenAI O-series (Reasoning)
  {
    id: "openai/o1",
    name: "o1",
    version: "1",
    inputPrice: 15.0,
    outputPrice: 60.0,
    contextWindow: 200000,
    maxOutput: 100000,
    reasoning: true,
    toolCalling: true,
  },
  {
    id: "openai/o1-mini",
    name: "o1-mini",
    version: "1-mini",
    inputPrice: 1.1,
    outputPrice: 4.4,
    contextWindow: 128000,
    maxOutput: 65536,
    reasoning: true,
    toolCalling: true,
  },
  {
    id: "openai/o3",
    name: "o3",
    version: "3",
    inputPrice: 2.0,
    outputPrice: 8.0,
    contextWindow: 200000,
    maxOutput: 100000,
    reasoning: true,
    toolCalling: true,
  },
  {
    id: "openai/o3-mini",
    name: "o3-mini",
    version: "3-mini",
    inputPrice: 1.1,
    outputPrice: 4.4,
    contextWindow: 128000,
    maxOutput: 100000,
    reasoning: true,
    toolCalling: true,
  },
  {
    id: "openai/o4-mini",
    name: "o4-mini",
    version: "4-mini",
    inputPrice: 1.1,
    outputPrice: 4.4,
    contextWindow: 128000,
    maxOutput: 100000,
    reasoning: true,
    toolCalling: true,
  },

  // Anthropic - all Claude models excel at agentic workflows
  // Use newest versions (4.6) with full provider prefix
  {
    id: "anthropic/claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    version: "4.5",
    inputPrice: 1.0,
    outputPrice: 5.0,
    contextWindow: 200000,
    maxOutput: 64000,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "anthropic/claude-sonnet-4.6",
    name: "Claude Sonnet 4.6",
    version: "4.6",
    inputPrice: 3.0,
    outputPrice: 15.0,
    contextWindow: 1000000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "anthropic/claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    version: "4.5",
    inputPrice: 3.0,
    outputPrice: 15.0,
    contextWindow: 200000,
    maxOutput: 64000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "anthropic/claude-opus-4.5",
    name: "Claude Opus 4.5",
    version: "4.5",
    inputPrice: 5.0,
    outputPrice: 25.0,
    contextWindow: 200000,
    maxOutput: 64000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "anthropic/claude-opus-4.6",
    name: "Claude Opus 4.6",
    version: "4.6",
    inputPrice: 5.0,
    outputPrice: 25.0,
    contextWindow: 1000000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    // Anthropic's current flagship (backend FEATURED since 2026-05-28).
    // Same $5/$25 as 4.7 — 1M ctx, 128K out, adaptive thinking.
    id: "anthropic/claude-opus-4.8",
    name: "Claude Opus 4.8",
    version: "4.8",
    inputPrice: 5.0,
    outputPrice: 25.0,
    contextWindow: 1000000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "anthropic/claude-opus-4.7",
    name: "Claude Opus 4.7",
    version: "4.7",
    inputPrice: 5.0,
    outputPrice: 25.0,
    contextWindow: 1000000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },

  // Google
  {
    id: "google/gemini-3.1-pro",
    name: "Gemini 3.1 Pro",
    version: "3.1",
    inputPrice: 2.0,
    outputPrice: 12.0,
    contextWindow: 1048576,
    maxOutput: 65536,
    reasoning: true,
    vision: true,
    toolCalling: true,
  },
  {
    id: "google/gemini-3-pro-preview",
    name: "Gemini 3 Pro Preview",
    version: "3.0",
    inputPrice: 2.0,
    outputPrice: 12.0,
    contextWindow: 1050000,
    maxOutput: 65536,
    reasoning: true,
    vision: true,
    toolCalling: true,
  },
  {
    // Latest-generation Flash with built-in thinking mode (backend
    // 2026-05-19) — frontier-class quality at Flash pricing.
    id: "google/gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    version: "3.5",
    inputPrice: 1.5,
    outputPrice: 9.0,
    contextWindow: 1048576,
    maxOutput: 65536,
    reasoning: true,
    vision: true,
    toolCalling: true,
  },
  {
    id: "google/gemini-3-flash-preview",
    name: "Gemini 3 Flash Preview",
    version: "3.0",
    inputPrice: 0.5,
    outputPrice: 3.0,
    contextWindow: 1048576,
    maxOutput: 65536,
    vision: true,
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    version: "2.5",
    inputPrice: 1.25,
    outputPrice: 10.0,
    contextWindow: 1048576,
    maxOutput: 65536,
    reasoning: true,
    vision: true,
    toolCalling: true,
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    version: "2.5",
    inputPrice: 0.3,
    outputPrice: 2.5,
    contextWindow: 1048576,
    maxOutput: 65536,
    vision: true,
    toolCalling: true,
  },
  {
    id: "google/gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    version: "2.5",
    inputPrice: 0.1,
    outputPrice: 0.4,
    contextWindow: 1048576,
    maxOutput: 65536,
    toolCalling: true,
  },
  {
    id: "google/gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    version: "3.1",
    inputPrice: 0.25,
    outputPrice: 1.5,
    contextWindow: 1048576,
    maxOutput: 65536,
    toolCalling: true,
  },

  // DeepSeek
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V4 Flash Chat",
    version: "4-flash",
    inputPrice: 0.14,
    outputPrice: 0.28,
    contextWindow: 1048576,
    maxOutput: 65536,
    toolCalling: true,
  },
  {
    id: "deepseek/deepseek-reasoner",
    name: "DeepSeek V4 Flash Reasoner",
    version: "4-flash",
    inputPrice: 0.14,
    outputPrice: 0.28,
    contextWindow: 1048576,
    maxOutput: 65536,
    reasoning: true,
    toolCalling: true,
  },
  {
    // V4 flagship — strongest open-weight reasoner. Resold via BlockRun's
    // OpenRouter credit pool.
    id: "deepseek/deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    version: "4-pro",
    inputPrice: 1.32,
    outputPrice: 3.96,
    contextWindow: 1048576,
    maxOutput: 65536,
    reasoning: true,
    agentic: true,
    toolCalling: true,
  },

  // Kimi K2.6 — Moonshot's current flagship (256K context, vision + reasoning). Only served via Moonshot direct API.
  {
    id: "moonshot/kimi-k2.6",
    name: "Kimi K2.6",
    version: "k2.6",
    inputPrice: 0.95,
    outputPrice: 4.0,
    contextWindow: 262144,
    maxOutput: 65536,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },

  // Kimi K2.5 — Moonshot direct is primary (better SLA). NVIDIA-hosted variant
  // retired 2026-04-21 (slow throughput) and now redirects to moonshot.
  {
    id: "moonshot/kimi-k2.5",
    name: "Kimi K2.5",
    version: "k2.5",
    inputPrice: 0.6,
    outputPrice: 3.0,
    contextWindow: 262144,
    maxOutput: 16384,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "nvidia/kimi-k2.5",
    name: "Kimi K2.5 (NVIDIA, retired)",
    version: "k2.5",
    inputPrice: 0.6,
    outputPrice: 3.0,
    contextWindow: 262144,
    maxOutput: 8192,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
    deprecated: true,
    fallbackModel: "moonshot/kimi-k2.5",
  },

  // xAI / Grok
  {
    id: "xai/grok-3",
    name: "Grok 3",
    version: "3",
    inputPrice: 3.0,
    outputPrice: 15.0,
    contextWindow: 131072,
    maxOutput: 16384,
    reasoning: true,
    toolCalling: true,
    // Server-side redirect on blockrun (MODEL_REDIRECTS): Azure Foundry EOL'd
    // this line 2026-05-01, so the gateway serves it as grok-4-1-fast-non-reasoning. Kept for pins.
    deprecated: true,
    fallbackModel: "xai/grok-4-1-fast-non-reasoning",
  },
  // grok-3-fast removed - too expensive ($5/$25), use grok-4-fast instead
  {
    id: "xai/grok-3-mini",
    name: "Grok 3 Mini",
    version: "3-mini",
    inputPrice: 0.3,
    outputPrice: 0.5,
    contextWindow: 131072,
    maxOutput: 16384,
    toolCalling: true,
    // Server-side redirect on blockrun (MODEL_REDIRECTS): Azure Foundry EOL'd
    // this line 2026-05-01, so the gateway serves it as grok-4-1-fast-non-reasoning. Kept for pins.
    deprecated: true,
    fallbackModel: "xai/grok-4-1-fast-non-reasoning",
  },

  // xAI Grok 4 Family - Ultra-cheap fast models
  {
    id: "xai/grok-4-fast-reasoning",
    name: "Grok 4 Fast Reasoning",
    version: "4",
    inputPrice: 0.2,
    outputPrice: 0.5,
    contextWindow: 131072,
    maxOutput: 16384,
    reasoning: true,
    toolCalling: true,
    // Server-side redirect on blockrun (MODEL_REDIRECTS): Azure Foundry EOL'd
    // this line 2026-05-01, so the gateway serves it as grok-4-1-fast-reasoning. Kept for pins.
    deprecated: true,
    fallbackModel: "xai/grok-4-1-fast-reasoning",
  },
  {
    id: "xai/grok-4-fast-non-reasoning",
    name: "Grok 4 Fast",
    version: "4",
    inputPrice: 0.2,
    outputPrice: 0.5,
    contextWindow: 131072,
    maxOutput: 16384,
    toolCalling: true,
    // Server-side redirect on blockrun (MODEL_REDIRECTS): Azure Foundry EOL'd
    // this line 2026-05-01, so the gateway serves it as grok-4-1-fast-non-reasoning. Kept for pins.
    deprecated: true,
    fallbackModel: "xai/grok-4-1-fast-non-reasoning",
  },
  {
    id: "xai/grok-4-1-fast-reasoning",
    name: "Grok 4.1 Fast Reasoning",
    version: "4.1",
    inputPrice: 0.2,
    outputPrice: 0.5,
    contextWindow: 131072,
    maxOutput: 16384,
    reasoning: true,
    toolCalling: true,
  },
  {
    id: "xai/grok-4-1-fast-non-reasoning",
    name: "Grok 4.1 Fast",
    version: "4.1",
    inputPrice: 0.2,
    outputPrice: 0.5,
    contextWindow: 131072,
    maxOutput: 16384,
    toolCalling: true,
  },
  // xai/grok-code-fast-1 delisted 2026-03-12: poor retention (coding users churn),
  // no structured tool calling, alias "grok-code" redirected to deepseek-chat
  {
    id: "xai/grok-4-0709",
    name: "Grok 4 (0709)",
    version: "4-0709",
    inputPrice: 3.0,
    outputPrice: 15.0,
    contextWindow: 131072,
    maxOutput: 16384,
    reasoning: true,
    toolCalling: true,
  },
  {
    id: "xai/grok-2-vision",
    name: "Grok 2 Vision",
    version: "2",
    inputPrice: 2.0,
    outputPrice: 10.0,
    contextWindow: 131072,
    maxOutput: 16384,
    vision: true,
    toolCalling: true,
    // Retired upstream 2026-07-07 (HTTP 400 on api.x.ai, no route anywhere);
    // the gateway redirects it to grok-4.3. Kept for pins.
    deprecated: true,
    fallbackModel: "xai/grok-4.3",
  },

  // xAI Grok 4.20 Family (hidden in picker; explicit-only — mirrors BlockRun hidden:true)
  {
    id: "xai/grok-4.20-reasoning",
    name: "Grok 4.20 Reasoning",
    version: "4.20",
    inputPrice: 2.0,
    outputPrice: 6.0,
    contextWindow: 2000000,
    maxOutput: 16384,
    reasoning: true,
    toolCalling: true,
  },
  {
    id: "xai/grok-4.20-non-reasoning",
    name: "Grok 4.20",
    version: "4.20",
    inputPrice: 2.0,
    outputPrice: 6.0,
    contextWindow: 2000000,
    maxOutput: 16384,
    toolCalling: true,
  },
  {
    id: "xai/grok-4.20-multi-agent",
    name: "Grok 4.20 Multi-Agent",
    version: "4.20",
    inputPrice: 2.0,
    outputPrice: 6.0,
    contextWindow: 2000000,
    maxOutput: 16384,
    reasoning: true,
    toolCalling: true,
  },

  // xAI via BlockRun's OpenRouter credit pool (public in backend catalog,
  // added 2026-06-04). Picker-visible — listed in top-models.json.
  {
    id: "xai/grok-4.3",
    name: "Grok 4.3",
    version: "4.3",
    inputPrice: 1.25,
    outputPrice: 2.5,
    contextWindow: 1000000,
    maxOutput: 16384,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "xai/grok-build-0.1",
    name: "Grok Build 0.1",
    version: "0.1",
    inputPrice: 1.0,
    outputPrice: 2.0,
    contextWindow: 256000,
    maxOutput: 16384,
    agentic: true,
    toolCalling: true,
  },

  // MiniMax
  {
    id: "minimax/minimax-m3",
    name: "MiniMax M3",
    version: "m3",
    inputPrice: 0.3,
    outputPrice: 1.2,
    contextWindow: 1048576,
    maxOutput: 65536,
    reasoning: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "minimax/minimax-m2.7",
    name: "MiniMax M2.7",
    version: "m2.7",
    inputPrice: 0.3,
    outputPrice: 1.2,
    contextWindow: 204800,
    maxOutput: 16384,
    reasoning: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "minimax/minimax-m2.5",
    name: "MiniMax M2.5",
    version: "m2.5",
    inputPrice: 0.3,
    outputPrice: 1.2,
    contextWindow: 204800,
    maxOutput: 16384,
    reasoning: true,
    agentic: true,
    toolCalling: true,
    deprecated: true,
    fallbackModel: "minimax/minimax-m2.7",
  },

  // Free models (hosted by NVIDIA, billingMode: "free" on server)
  // IDs use "free/" prefix so users see them as free in the /model picker.
  // ClawRouter maps free/xxx → nvidia/xxx before sending to BlockRun upstream
  // (see toUpstreamModelId in src/proxy.ts). BlockRun's NVIDIA_MODEL_MAP in
  // src/lib/ai-providers.ts maps known IDs to upstream NIM names; for IDs not
  // in the map, BlockRun falls through to the bare name (modelMap[k] || k),
  // so new entries here only need to match BlockRun's catalog ID — NVIDIA NIM
  // accepts the bare name directly.
  // toolCalling intentionally omitted: structured function calling unverified.
  // 2026-04-29: kept gpt-oss-120b/20b as defaults (heavy user demand); added
  //   v4-pro / v4-flash (1M context, ~5x speed split) and nemotron-3-nano-omni
  //   (first vision-capable free model, 256K context, accepts text/image/video/audio).
  // 2026-04-21: slimmed to 8 models, retired nemotron family + mistral-large-3-675b
  //   + devstral-2-123b with successor redirects.
  {
    id: "anthropic/claude-fable-5",
    name: "Claude Fable 5",
    version: "5",
    inputPrice: 10.0,
    outputPrice: 50.0,
    contextWindow: 1000000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "anthropic/claude-opus-5",
    name: "Claude Opus 5",
    version: "5",
    inputPrice: 5.0,
    outputPrice: 25.0,
    contextWindow: 1000000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    // Newest Sonnet — near-Opus coding/agentic quality at Sonnet cost
    // ($2/$10, below 4.6's $3/$15), 1M ctx / 128K out / adaptive thinking. Kept as
    // an opt-in distinct model (bare `sonnet`/`claude` still resolve to 4.6);
    // primaries not promoted pending benchmarks. BlockRun fallback → sonnet-4.6.
    id: "anthropic/claude-sonnet-5",
    name: "Claude Sonnet 5",
    version: "5",
    inputPrice: 2.0,
    outputPrice: 10.0,
    contextWindow: 1000000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    // Successor to Fable 5, same tier and price. Always-on thinking; BlockRun falls back to fable-5.
    id: "anthropic/claude-fable-5.1",
    name: "Claude Fable 5.1",
    version: "5.1",
    inputPrice: 10.0,
    outputPrice: 50.0,
    contextWindow: 1000000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    // Opus-class at a lower price than Opus 5. Thinking cannot be disabled; no BlockRun fallback.
    id: "anthropic/claude-opus-5.5",
    name: "Claude Opus 5.5",
    version: "5.5",
    inputPrice: 4.0,
    outputPrice: 20.0,
    contextWindow: 1000000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    // Newest Sonnet. Opt-in only (aliases unchanged); BlockRun falls back to sonnet-5.
    id: "anthropic/claude-sonnet-5.5",
    name: "Claude Sonnet 5.5",
    version: "5.5",
    inputPrice: 2.0,
    outputPrice: 10.0,
    contextWindow: 1000000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    // Terra/Luna repriced 2026-07-30 (OpenAI price cut, blockrun #326).
    id: "openai/gpt-5.6-terra",
    name: "GPT-5.6 Terra",
    version: "5.6",
    inputPrice: 2.0,
    outputPrice: 12.0,
    contextWindow: 1050000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    // Cut from $5/$30 on 2026-08-21.
    id: "openai/gpt-5.6-sol",
    name: "GPT-5.6 Sol",
    version: "5.6",
    inputPrice: 4.0,
    outputPrice: 20.0,
    contextWindow: 1050000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "openai/gpt-5.6-luna",
    name: "GPT-5.6 Luna",
    version: "5.6",
    inputPrice: 0.2,
    outputPrice: 1.2,
    contextWindow: 1050000,
    maxOutput: 128000,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    // GPT-5.6 Pro tiers (blockrun #329): each base tier with pro reasoning mode,
    // priced the same as its base tier.
    id: "openai/gpt-5.6-sol-pro",
    name: "GPT-5.6 Sol Pro",
    version: "5.6",
    inputPrice: 4.0,
    outputPrice: 20.0,
    contextWindow: 1050000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "openai/gpt-5.6-terra-pro",
    name: "GPT-5.6 Terra Pro",
    version: "5.6",
    inputPrice: 2.0,
    outputPrice: 12.0,
    contextWindow: 1050000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "openai/gpt-5.6-luna-pro",
    name: "GPT-5.6 Luna Pro",
    version: "5.6",
    inputPrice: 0.2,
    outputPrice: 1.2,
    contextWindow: 1050000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "openai/gpt-5.5-pro",
    name: "GPT-5.5 Pro",
    version: "5.5",
    inputPrice: 30.0,
    outputPrice: 180.0,
    contextWindow: 1050000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    toolCalling: true,
  },
  {
    // ChatGPT Instant — upstream exposes ChatGPT's default model only as the rolling
    // `chat-latest` id, so the display name tracks whichever snapshot is current.
    // Chat/vision only upstream.
    id: "openai/chat-latest",
    name: "ChatGPT Instant (GPT-5.5)",
    version: "5.5",
    inputPrice: 5.0,
    outputPrice: 30.0,
    contextWindow: 128000,
    maxOutput: 128000,
    vision: true,
    toolCalling: true,
  },
  {
    // GPT-6 flagship. Above 272K input BlockRun bills $20/$75; Flex (service_tier) is half price.
    id: "openai/gpt-6-astra",
    name: "GPT-6 Astra",
    version: "6",
    inputPrice: 10.0,
    outputPrice: 50.0,
    contextWindow: 1050000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    // Above 272K input: $4/$15.
    id: "openai/gpt-6-sol",
    name: "GPT-6 Sol",
    version: "6",
    inputPrice: 2.0,
    outputPrice: 10.0,
    contextWindow: 1050000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    // GPT-6.1 Sol (blockrun 2026-10-09): the refreshed Sol, same $2/$10 and envelope
    // as gpt-6-sol; cached input is half of Sol's. Vision confirmed upstream.
    id: "openai/gpt-6.1-sol",
    name: "GPT-6.1 Sol",
    version: "6.1",
    inputPrice: 2.0,
    outputPrice: 10.0,
    contextWindow: 1050000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    // Above 272K input: $0.20/$0.75.
    id: "openai/gpt-6-luna",
    name: "GPT-6 Luna",
    version: "6",
    inputPrice: 0.1,
    outputPrice: 0.5,
    contextWindow: 1050000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "openai/gpt-5.1",
    name: "GPT-5.1",
    version: "5.1",
    inputPrice: 1.25,
    outputPrice: 10.0,
    contextWindow: 400000,
    maxOutput: 128000,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    // Newest-generation Flash with built-in thinking mode (blockrun #329,
    // 2026-08-03).
    id: "google/gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    version: "3.6",
    inputPrice: 0.75,
    outputPrice: 3.75,
    contextWindow: 1048576,
    maxOutput: 65536,
    reasoning: true,
    vision: true,
    toolCalling: true,
  },
  {
    // ⏰ PROMOTIONAL RATE: Google prices the 3.6/3.7/3.8 Flash band at 0.75/3.75
    // through 2026-12-31, reverting to 1.50/7.50. Re-price with gemini-3.6-flash.
    id: "google/gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    version: "3.8",
    inputPrice: 0.75,
    outputPrice: 3.75,
    contextWindow: 1048576,
    maxOutput: 65536,
    reasoning: true,
    vision: true,
    toolCalling: true,
  },
  {
    // Ultra-fast lightweight tier with thinking mode (blockrun #329).
    id: "google/gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    version: "3.5",
    inputPrice: 0.3,
    outputPrice: 2.5,
    contextWindow: 1048576,
    maxOutput: 65536,
    reasoning: true,
    toolCalling: true,
  },
  {
    id: "xai/grok-4.5",
    name: "Grok 4.5",
    version: "4.5",
    inputPrice: 2.0,
    outputPrice: 6.0,
    contextWindow: 500000,
    maxOutput: 16384,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    // BlockRun bills 2x ($4/$12) at >=200K input. Live Search is +$0.30 per call.
    id: "xai/grok-4.6",
    name: "Grok 4.6",
    version: "4.6",
    inputPrice: 2.0,
    outputPrice: 6.0,
    contextWindow: 500000,
    maxOutput: 16384,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    // Same pricing as 4.6; BlockRun falls back to grok-4.6.
    id: "xai/grok-4.7",
    name: "Grok 4.7",
    version: "4.7",
    inputPrice: 2.0,
    outputPrice: 6.0,
    contextWindow: 500000,
    maxOutput: 16384,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    // Z.AI's flagship, live-probed by blockrun 2026-08-19 against api.z.ai
    // (real completion in 2s, content alongside reasoning tokens). $1.40/$4.40,
    // cached input $0.26, off the international USD price list.
    // maxOutput is 131072, NOT the 1M context: that is the hard ceiling the API
    // enforces (error 1210 above it), the same on every GLM-5 SKU.
    // Thinking is ALWAYS ON here and cannot be disabled.
    id: "zai/glm-5.3",
    name: "GLM-5.3",
    version: "5.3",
    inputPrice: 1.4,
    outputPrice: 4.4,
    contextWindow: 1000000,
    maxOutput: 131072,
    reasoning: true,
    toolCalling: true,
  },
  {
    // Z.AI's first natively multimodal GLM-5 — 320B/18B MoE. blockrun probed
    // text, vision (base64 data URL → correct answer), tools
    // (finish_reason=tool_calls with well-formed arguments) and streaming live
    // on 2026-08-27 before listing it.
    //
    // MUST be in this catalog, not just router-core's: it is router-core's eco
    // MEDIUM and COMPLEX primary, and estimateAmount() returns undefined for an
    // id we do not carry — which makes the request skip the maxCostPerRun filter
    // AND never accumulate into session cost. An uncatalogued routing target is
    // a cost-cap hole, not a logging gap.
    //
    // Price is the LIST rate. Z.AI is running a 50% launch promo ($0.075/$0.25)
    // that ENDS 2026-09-09; listing the promo rate would put us under COGS the
    // morning it lapses. Thinking is always on, as on glm-5.3.
    id: "zai/glm-5.3-flash",
    name: "GLM-5.3 Flash",
    version: "5.3-flash",
    inputPrice: 0.15,
    outputPrice: 0.5,
    contextWindow: 1000000,
    maxOutput: 131072,
    reasoning: true,
    vision: true,
    toolCalling: true,
  },
  {
    // Launched 2026-06-16. Was Z.AI's flagship until glm-5.3 (above) took the
    // slot on 2026-08-19. 1M-token context,
    // beats GPT-5.5 on long-horizon coding at a fraction of the cost.
    // Paid per-token at $1.40/$4.40 (same as glm-5.1, cached $0.26).
    id: "zai/glm-5.2",
    name: "GLM-5.2",
    version: "5.2",
    inputPrice: 1.4,
    outputPrice: 4.4,
    contextWindow: 1000000,
    maxOutput: 131072,
    reasoning: true,
    toolCalling: true,
  },
  {
    // NOT a cheaper mimo-v2.5-pro — a different, natively multimodal SKU. The
    // Pro entry is text-only upstream while this one takes images, at a third
    // of the price. Keep both.
    id: "xiaomi/mimo-v2.5",
    name: "Xiaomi MiMo V2.5",
    version: "2.5",
    inputPrice: 0.14,
    outputPrice: 0.28,
    contextWindow: 1048576,
    maxOutput: 131072,
    reasoning: true,
    vision: true,
    toolCalling: true,
  },
  {
    id: "xiaomi/mimo-v2.5-pro",
    name: "Xiaomi MiMo-V2.5 Pro",
    version: "v2.5-pro",
    inputPrice: 0.435,
    outputPrice: 0.87,
    contextWindow: 1048576,
    maxOutput: 131072,
    reasoning: true,
    toolCalling: true,
  },
  {
    // 770B / 49B-active MoE. maxOutput is the smallest vendor ceiling in the routed
    // pool. Verbose reasoner — a small max_tokens can return no content.
    id: "tencent/hy4-preview",
    name: "Tencent Hy4 Preview",
    version: "hy4-preview",
    inputPrice: 0.834,
    outputPrice: 2.501,
    contextWindow: 1048576,
    maxOutput: 64000,
    reasoning: true,
  },
  {
    // ⏰ $0.68/$2.09 is a LAUNCH PROMO upstream (Mistral lists $1.36/$4.18).
    // blockrun probed text, stream, tools (clean tool_calls) and image input.
    id: "mistral/mistral-large-4",
    name: "Mistral Large 4",
    version: "large-4",
    inputPrice: 0.68,
    outputPrice: 2.09,
    contextWindow: 524288,
    maxOutput: 262144,
    reasoning: true,
    vision: true,
    toolCalling: true,
  },
  {
    // The PAID, far larger sibling of free/laguna-xs-2.1 (118B / 8B active).
    id: "poolside/laguna-s-2.1",
    name: "Poolside Laguna S 2.1",
    version: "s-2.1",
    inputPrice: 0.09,
    outputPrice: 0.18,
    contextWindow: 1048576,
    maxOutput: 131072,
  },
  {
    id: "moonshot/kimi-k3",
    name: "Kimi K3",
    version: "k3",
    inputPrice: 3.0,
    outputPrice: 15.0,
    contextWindow: 1048576,
    maxOutput: 65536,
    reasoning: true,
    vision: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "qwen/qwen3.7-max",
    name: "Qwen3.7 Max",
    version: "3.7-max",
    inputPrice: 1.475,
    outputPrice: 4.425,
    contextWindow: 1000000,
    maxOutput: 65536,
    reasoning: true,
    agentic: true,
    toolCalling: true,
  },
  {
    // Qwen3.7 Plus/Flash (blockrun #329): the balanced and latency tiers under Max.
    id: "qwen/qwen3.7-plus",
    name: "Qwen3.7 Plus",
    version: "3.7-plus",
    inputPrice: 0.32,
    outputPrice: 1.28,
    contextWindow: 1000000,
    maxOutput: 131072,
    reasoning: true,
    agentic: true,
    toolCalling: true,
  },
  {
    id: "qwen/qwen3.7-flash",
    name: "Qwen3.7 Flash",
    version: "3.7-flash",
    inputPrice: 0.03,
    outputPrice: 0.13,
    contextWindow: 1000000,
    maxOutput: 65536,
    reasoning: true,
    toolCalling: true,
  },
  {
    // The 3.8 generation's flagship. Listed text-only, as on the gateway.
    // toolCalling left opt-in: no structured tool_calls probe is recorded.
    id: "qwen/qwen3.8-max",
    name: "Qwen3.8 Max",
    version: "3.8-max",
    inputPrice: 2.0,
    outputPrice: 6.0,
    contextWindow: 1000000,
    maxOutput: 131072,
    reasoning: true,
  },
  {
    // Alibaba's 3.8 generation: 125B MoE, one tier above the whole 3.7 line and
    // cheaper than the qwen3.7-plus ($0.32/$1.28) it outperforms.
    // Vision took two probes to establish upstream: the first 400'd with
    // `invalid_parameter_error` on an 8x8 PNG because the model requires >10px
    // per side; 64x64 answered correctly. A single 400 is not a capability gap.
    id: "qwen/qwen3.8-flash",
    name: "Qwen3.8 Flash",
    version: "3.8-flash",
    inputPrice: 0.15,
    outputPrice: 0.47,
    contextWindow: 1000000,
    maxOutput: 131072,
    reasoning: true,
    vision: true,
    toolCalling: true,
  },
  {
    // Retired (hidden) on BlockRun; kept so explicit pins still resolve.
    id: "tencent/hy3",
    name: "Tencent Hy3",
    version: "hy3",
    inputPrice: 0.132,
    outputPrice: 0.528,
    contextWindow: 262144,
    maxOutput: 128000,
    reasoning: true,
    toolCalling: true,
    // RETIRED 2026-09-24: hidden on blockrun and redirected server-side to
    // qwen/qwen3.7-flash. Entry kept so explicit pins stay routable; off the picker.
    deprecated: true,
    fallbackModel: "qwen/qwen3.7-flash",
  },
  {
    // The first DeepSeek SKU that takes images. BlockRun bills it at the V4
    // Flash price ($0.30/$1.20).
    id: "deepseek/deepseek-v4-flash-vision-exp",
    name: "DeepSeek V4 Flash Vision",
    version: "v4-flash-vision-exp",
    inputPrice: 0.3,
    outputPrice: 1.2,
    contextWindow: 1048576,
    maxOutput: 65536,
    reasoning: true,
    vision: true,
    toolCalling: true,
  },
  // EOL 2026-09-03: NVIDIA publishes 410 Gone with an end-of-life date for
  // gpt-oss-120b. The gateway marks it available:false and redirects it to
  // nvidia/nemotron-3-super-120b. Kept for pins; off the picker and every default.
  {
    id: "free/gpt-oss-120b",
    name: "[Free] GPT-OSS 120B",
    version: "120b",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 128000,
    maxOutput: 16384,
  },
  {
    id: "free/gpt-oss-20b",
    name: "[Free] GPT-OSS 20B",
    version: "20b",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 128000,
    maxOutput: 16384,
  },
  {
    // V4 Flash: 284B / 13B active MoE, 1M context. ~5x faster than V4 Pro.
    // Strong on chat/summarization (MMLU-Pro 86.2). Caveat: weaker factual
    // recall (SimpleQA 34% vs Pro's 58%) — pick V4 Pro for fact-heavy loops.
    id: "free/deepseek-v4-flash",
    name: "[Free] DeepSeek V4 Flash",
    version: "v4-flash",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 1000000,
    maxOutput: 16384,
    reasoning: true,
  },
  {
    id: "free/qwen3-coder-480b",
    name: "[Free] Qwen3 Coder 480B",
    version: "480b",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 131072,
    maxOutput: 16384,
  },
  {
    id: "free/glm-4.7",
    name: "[Free] GLM-4.7",
    version: "4.7",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 131072,
    maxOutput: 16384,
    reasoning: true,
  },
  {
    id: "free/llama-4-maverick",
    name: "[Free] Llama 4 Maverick",
    version: "4-maverick",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 131072,
    maxOutput: 16384,
    reasoning: true,
  },
  {
    // Nemotron 3 Nano Omni: first vision-capable free model. 31B / 3.2B active
    // MoE, 256K context. ChartQA 90.3, DocVQA 95.6, MMMU 70.8. Accepts text,
    // images, video (up to 2min), audio (up to 1hr). Released 2026-04-27.
    id: "free/nemotron-3-nano-omni-30b-a3b-reasoning",
    name: "[Free] Nemotron 3 Nano Omni",
    version: "30b-a3b-omni-reasoning",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 256000,
    maxOutput: 16384,
    reasoning: true,
    vision: true,
  },
  {
    // Nemotron 3.5 Lightning 30B-A3B — the new free default. blockrun's own
    // redirect target for the retired step-3.7-flash, so following it keeps the
    // proxy and the gateway naming the same model. Served from OpenRouter's $0
    // pool (4.9s median vs 16.3s direct) which also publishes a 1M window
    // against the 131K the NVIDIA NIM path gives; blockrun carries a hidden
    // "-nim" twin as its fallback. Probed 1.3s with tools.
    id: "free/nemotron-3.5-lightning",
    name: "[Free] Nemotron 3.5 Lightning",
    version: "3.5-lightning",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 1000000,
    maxOutput: 16384,
    reasoning: true,
  },
  {
    // Nemotron 3 Nano 30B-A3B — was the fastest free model in the catalog
    // (~121 tok/s). DELISTED 2026-09-08: NVIDIA deprovisioned it for
    // blockrun's account, and the gateway now redirects it to nano-omni. Entry
    // kept so an explicit pin keeps resolving; off the picker, the FREE_MODELS
    // cascade and the router tiers.
    id: "free/nemotron-3-nano-30b",
    name: "[Free] Nemotron 3 Nano 30B",
    version: "3-nano-30b",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 131072,
    maxOutput: 16384,
    reasoning: true,
  },
  {
    // Poolside Laguna XS 2.1 on OUR NVIDIA key (~161 tok/s). Deliberately not
    // the OpenRouter twin, which 429s on every attempt — so this rung and
    // north-mini-code sit on DIFFERENT capacity pools, which is why they are
    // adjacent in the cascade.
    // NOTE: NOT an nvidia/* id upstream — see FREE_UPSTREAM_OVERRIDES in proxy.ts.
    id: "free/laguna-xs-2.1",
    name: "[Free] Poolside Laguna XS 2.1",
    version: "xs-2.1",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 131072,
    maxOutput: 16384,
  },
  {
    // Cohere North Mini Code, on OpenRouter's $0 pool — 607ms median, the
    // fastest thing in the tier. Emits reasoning_content (content is clean once
    // the budget is large enough to finish, verified live).
    // NOTE: NOT an nvidia/* id upstream — see FREE_UPSTREAM_OVERRIDES in proxy.ts.
    id: "free/north-mini-code",
    name: "[Free] Cohere North Mini Code",
    version: "north-mini-code",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 256000,
    maxOutput: 16384,
    reasoning: true,
  },
  {
    // Nemotron 3 Ultra 550B-A55B — the largest free model ever listed, 1M ctx,
    // reachable ONLY through OpenRouter's $0 pool (build.nvidia.com answers 503).
    // Deliberately LOW in the cascade: 16.8s on the tools probe, and blockrun
    // measured 3 of 15 calls coming back as an HTTP 200 carrying an upstream
    // 502/503 error object instead of choices.
    id: "free/nemotron-3-ultra-550b",
    name: "[Free] Nemotron 3 Ultra 550B",
    version: "3-ultra-550b",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 1000000,
    maxOutput: 16384,
    reasoning: true,
  },
  {
    // Meta Llama 3.2 11B Vision — restores a free Llama after nemotron-super-49b
    // (Llama-3.3-based) hit NVIDIA's 410 EOL. A 12-model sweep found exactly two
    // survivors and only the 11B finishes a real completion. Older than the rest
    // of the tier and deliberately so: it is a real Llama that actually answers.
    // Slowest in the tier (~18 tok/s) — last rung of the cascade.
    id: "free/llama-3.2-11b-vision",
    name: "[Free] Llama 3.2 11B Vision",
    version: "3.2-11b-vision",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 128000,
    maxOutput: 16384,
    // NO `vision: true` despite the name and blockrun's `categories:
    // ["chat","vision"]` — 2026-08-31, three consecutive 64x64 PNG probes came
    // back "I'm unable to see the image" / "you haven't provided an image",
    // while a plain-text control on the same id answered fine. The model is
    // alive; the image path is not. Mirroring the catalog's claim here would
    // have routed image turns to it. See the nano-omni note above.
  },
  {
    // Meta Muse Glimmer 30B — free on NVIDIA as nvidia/muse-glimmer-30b. A reasoning
    // model: a small max_tokens is spent in reasoning and returns empty content.
    // Text only. Picker-listed, not in the FREE_MODELS auto-pick cascade.
    id: "free/muse-glimmer-30b",
    name: "[Free] Muse Glimmer 30B",
    version: "30b",
    inputPrice: 0,
    outputPrice: 0,
    contextWindow: 131072,
    maxOutput: 16384,
    reasoning: true,
  },

  // Z.AI GLM-5 Models
  {
    // Launch promo (flat $0.001/call) ended 2026-06-05 — backend now bills
    // glm-5.1 per-token at $1.40/$4.40 (billingMode: "paid").
    id: "zai/glm-5.1",
    name: "GLM-5.1",
    version: "5.1",
    inputPrice: 1.4,
    outputPrice: 4.4,
    contextWindow: 200000,
    maxOutput: 128000,
    toolCalling: true,
    promo: { flatPrice: 0.001, startDate: "2026-04-01", endDate: "2026-06-05" },
  },
  {
    // Flat-rate launch promo ended 2026-06-06 — backend bills per-token now.
    id: "zai/glm-5",
    name: "GLM-5",
    version: "5",
    inputPrice: 1.0,
    outputPrice: 3.2,
    contextWindow: 200000,
    maxOutput: 128000,
    toolCalling: true,
  },
  {
    // Flat-rate launch promo ended 2026-06-06 — backend bills per-token now.
    id: "zai/glm-5-turbo",
    name: "GLM-5 Turbo",
    version: "5-turbo",
    inputPrice: 1.2,
    outputPrice: 4.0,
    contextWindow: 200000,
    maxOutput: 128000,
    toolCalling: true,
  },
];

/**
 * Get the active flat price for a model, or undefined if none.
 * Permanent flat pricing (flatPrice) never expires; promos auto-expire
 * after their endDate.
 */
export function getActivePromoPrice(
  model: BlockRunModel,
  now: Date = new Date(),
): number | undefined {
  if (model.flatPrice !== undefined) return model.flatPrice;
  if (!model.promo) return undefined;
  const start = new Date(model.promo.startDate);
  const end = new Date(model.promo.endDate);
  if (now >= start && now < end) return model.promo.flatPrice;
  return undefined;
}

/**
 * Convert BlockRun model definitions to OpenClaw ModelDefinitionConfig format.
 */
function toOpenClawModel(m: BlockRunModel): ModelDefinitionConfig {
  return {
    id: m.id,
    name: m.name,
    api: "openai-completions",
    reasoning: m.reasoning ?? false,
    input: m.vision ? ["text", "image"] : ["text"],
    cost: {
      input: m.inputPrice,
      output: m.outputPrice,
      cacheRead: 0,
      cacheWrite: 0,
    },
    contextWindow: m.contextWindow,
    maxTokens: m.maxOutput,
  };
}

/**
 * Alias models that map to real models.
 * These allow users to use friendly names like "free" or "gpt-120b".
 */
const ALIAS_MODELS: ModelDefinitionConfig[] = Object.entries(MODEL_ALIASES)
  .map(([alias, targetId]) => {
    const target = BLOCKRUN_MODELS.find((m) => m.id === targetId);
    if (!target) return null;
    return toOpenClawModel({ ...target, id: alias, name: `${alias} → ${target.name}` });
  })
  .filter((m): m is ModelDefinitionConfig => m !== null);

/**
 * All BlockRun models in OpenClaw format (including aliases).
 */
export const OPENCLAW_MODELS: ModelDefinitionConfig[] = [
  ...BLOCKRUN_MODELS.map(toOpenClawModel),
  ...ALIAS_MODELS,
];

/**
 * Build a ModelProviderConfig for BlockRun.
 *
 * @param baseUrl - The proxy's local base URL (e.g., "http://127.0.0.1:12345")
 */
export function buildProviderModels(baseUrl: string): ModelProviderConfig {
  return {
    baseUrl: `${baseUrl}/v1`,
    api: "openai-completions",
    models: OPENCLAW_MODELS,
  };
}

/**
 * Check if a model is optimized for agentic workflows.
 * Agentic models continue autonomously with multi-step tasks
 * instead of stopping and waiting for user input.
 */
export function isAgenticModel(modelId: string): boolean {
  const model = BLOCKRUN_MODELS.find(
    (m) => m.id === modelId || m.id === modelId.replace("blockrun/", ""),
  );
  return model?.agentic ?? false;
}

/**
 * Get all agentic-capable models.
 */
export function getAgenticModels(): string[] {
  return BLOCKRUN_MODELS.filter((m) => m.agentic).map((m) => m.id);
}

/**
 * Check if a model supports OpenAI-compatible structured tool/function calling.
 * Models without this flag (e.g. grok-code-fast-1) output tool invocations as
 * plain text JSON, which leaks {"command":"..."} into visible chat messages.
 */
export function supportsToolCalling(modelId: string): boolean {
  const normalized = modelId.replace("blockrun/", "");
  const model = BLOCKRUN_MODELS.find((m) => m.id === normalized);
  return model?.toolCalling ?? false;
}

/**
 * Check if a model supports vision (image inputs).
 * Models without this flag cannot process image_url content parts.
 */
export function supportsVision(modelId: string): boolean {
  const normalized = modelId.replace("blockrun/", "");
  const model = BLOCKRUN_MODELS.find((m) => m.id === normalized);
  return model?.vision ?? false;
}

/**
 * Get context window size for a model.
 * Returns undefined if model not found.
 */
export function getModelContextWindow(modelId: string): number | undefined {
  const normalized = modelId.replace("blockrun/", "");
  const model = BLOCKRUN_MODELS.find((m) => m.id === normalized);
  return model?.contextWindow;
}

/**
 * Check if a model has reasoning/thinking capabilities.
 * Reasoning models may require reasoning_content in assistant tool_call messages.
 */
export function isReasoningModel(modelId: string): boolean {
  const normalized = modelId.replace("blockrun/", "");
  const model = BLOCKRUN_MODELS.find((m) => m.id === normalized);
  return model?.reasoning ?? false;
}
