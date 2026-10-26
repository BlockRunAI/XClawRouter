---
name: xclawrouter
description: Smart LLM router for OKX — agentic wallet, x402 micropayments on Base + Solana. Routes every request to the cheapest capable model. Free models included.
triggers:
  - "xclawrouter"
  - "x claw router"
  - "@blockrun/xclawrouter"
  - "okx llm router"
  - "okx ai gateway"
  - "okx agentic wallet"
  - "onchainos"
  - "okx onchainos"
  - "okx x402"
  - "save on llm costs okx"
  - "cheapest model okx"
homepage: https://github.com/BlockRunAI/XClawRouter
metadata: { "openclaw": { "emoji": "🦀", "requires": { "config": ["models.providers.blockrun"] } } }
---

# XClawRouter

Smart LLM router that saves <!-- br:savings.autoVsBaselinePct -->84<!-- /br:savings.autoVsBaselinePct -->% on inference costs by routing each request to the cheapest model that can handle it. <!-- br:models.chatVisible -->90<!-- /br:models.chatVisible --> models across 9 providers (<!-- br:models.free -->7<!-- /br:models.free --> free models), all through one wallet.

## Install

```bash
openclaw plugins install @blockrun/xclawrouter
```

## Setup

```bash
# Enable smart routing (auto-picks cheapest model per request)
openclaw models set blockrun/auto

# Or pin a specific model
openclaw models set openai/gpt-4o
```

## How Routing Works

XClawRouter classifies each request into one of four tiers:

- **SIMPLE** — factual lookups, greetings, translations → gemini-2.5-flash
- **MEDIUM** — summaries, explanations, data extraction → kimi-k3
- **COMPLEX** — code generation, multi-step analysis → gemini-3.1-pro
- **REASONING** — proofs, formal logic, multi-step math → deepseek-reasoner

These are the default `auto` profile's tiers. Per-tier
savings percentages are deliberately not quoted: the published figure is blended
across a stated workload mix, and a per-tier number invites comparison against a
baseline nobody wrote down.

Rules handle ~~80% of requests in <1ms. Only ambiguous queries hit the LLM classifier (~~$0.00003 per classification).

## Available Models

<!-- br:models.chatVisible -->90<!-- /br:models.chatVisible --> models including: claude-fable-5.1, claude-fable-5, claude-opus-5.5, claude-opus-5, claude-sonnet-5.5, claude-sonnet-5, gpt-6-astra, gpt-6-sol, gpt-6.1-sol, gpt-6-luna, gpt-5.6-terra, gpt-5.6-sol, gpt-5.5, gpt-5.4, gpt-5.1, gemini-3.1-pro, gemini-3.6-flash, grok-4.7, grok-4.6, grok-4.5, grok-4.3, glm-5.3, kimi-k3, qwen3.8-max, qwen3.7-max, mistral-large-4, hy4-preview, laguna-s-2.1, mimo-v2.5, deepseek-v4-pro, deepseek-chat, and the free models (nemotron-3.5-lightning [default], laguna-xs-2.1, north-mini-code, nemotron-3-nano-omni-30b-a3b-reasoning [vision], nemotron-3-ultra-550b, llama-3.2-11b-vision [vision], muse-glimmer-30b).

## Model Prices — Look Them Up Live

Model prices move (vendors reprice, promos end), so this skill carries no model price table. Read the live catalog before you budget a call:

```bash
curl -s https://blockrun.ai/api/v1/models       # Base
curl -s https://sol.blockrun.ai/api/v1/models   # Solana
```

Each entry in `data[]` has an `id`, a `billing_mode` and a `pricing` object. All amounts are USD.

| `billing_mode`   | `pricing` fields                                                                                       | Estimated cost of one call                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `paid` (chat)    | `input`, `output` per 1M tokens; optional `cache_read` / `cache_write` per 1M; optional `long_context` | `(input_tokens × input + output_tokens × output) / 1,000,000`, minimum $0.001, plus the $0.001 transaction fee |
| `free`           | `input: 0`, `output: 0`                                                                                | $0 — no payment                                                                                                |
| `per_image`      | `per_image`, `transaction_fee`                                                                         | `per_image × images + transaction_fee`                                                                         |
| `per_second`     | `per_second`, `per_call_surcharge`, `transaction_fee`, `default_duration_seconds`                      | `per_second × seconds + per_call_surcharge + transaction_fee`                                                  |
| `per_track`      | `per_track`, `transaction_fee`                                                                         | `per_track + transaction_fee`                                                                                  |
| `per_character`  | `per_1k_chars`, `transaction_fee`                                                                      | `per_1k_chars × characters / 1,000 + transaction_fee`                                                          |
| `per_generation` | `per_generation`, `transaction_fee`                                                                    | `per_generation + transaction_fee`                                                                             |

- **Cached prompt tokens** bill at `cache_read` instead of `input` (and cache writes at `cache_write`) when the model lists them.
- **`long_context`** is a list of tiers. When the prompt is larger than a tier's `threshold` (or equal to it, if `inclusive` is true), that tier's `input` / `output` / `cache_*` rates apply to the **whole** request.
- Image size/quality and video resolution can raise the media price above the listed base rate.
- The figure above is an estimate. The exact amount is quoted in the HTTP 402 challenge before anything is signed, so a call never settles above its quote.
- Human-readable rate card: https://blockrun.ai/pricing

## Example Output

```
[XClawRouter] google/gemini-2.5-flash (SIMPLE, rules, confidence=0.92)
             Cost: $0.0025 | Baseline: $0.308 | Saved: 99.2%
```
