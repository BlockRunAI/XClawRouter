---
name: xclawrouter
description: Smart LLM router for OKX — agentic wallet, 66 models, x402 micropayments on Base + Solana. Routes every request to the cheapest capable model. 11 free NVIDIA models included.
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

Smart LLM router that saves <!-- br:savings.autoVsBaselinePct -->84<!-- /br:savings.autoVsBaselinePct -->% on inference costs by routing each request to the cheapest model that can handle it. <!-- br:models.chatVisible -->76<!-- /br:models.chatVisible --> models across 9 providers (<!-- br:models.free -->7<!-- /br:models.free --> free models), all through one wallet.

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

- **SIMPLE** — factual lookups, greetings, translations → gemini-2.5-flash ($0.30/$2.50)
- **MEDIUM** — summaries, explanations, data extraction → kimi-k3 ($3/$15)
- **COMPLEX** — code generation, multi-step analysis → gemini-3.1-pro ($2/$12)
- **REASONING** — proofs, formal logic, multi-step math → deepseek-reasoner ($0.14/$0.28)

Prices are per 1M input/output tokens on the default `auto` profile. Per-tier
savings percentages are deliberately not quoted: the published figure is blended
across a stated workload mix, and a per-tier number invites comparison against a
baseline nobody wrote down.

Rules handle ~~80% of requests in <1ms. Only ambiguous queries hit the LLM classifier (~~$0.00003 per classification).

## Available Models

<!-- br:models.chatVisible -->76<!-- /br:models.chatVisible --> models including: claude-fable-5, claude-opus-5, claude-sonnet-5, gpt-5.6-terra, gpt-5.6-sol, gpt-5.5, gpt-5.4, gemini-3.1-pro, gemini-3.6-flash, grok-4.5, grok-4.3, glm-5.3, kimi-k3, qwen3.7-max, mimo-v2.5, deepseek-v4-pro, deepseek-chat, and the free models (nemotron-3.5-lightning [default], nemotron-3-nano-30b, laguna-xs-2.1, north-mini-code, nemotron-3-nano-omni-30b-a3b-reasoning [vision], nemotron-3-ultra-550b, llama-3.2-11b-vision [vision]).

## Example Output

```
[XClawRouter] google/gemini-2.5-flash (SIMPLE, rules, confidence=0.92)
             Cost: $0.0025 | Baseline: $0.308 | Saved: 99.2%
```
