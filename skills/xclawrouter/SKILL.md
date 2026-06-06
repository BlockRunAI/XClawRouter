---
name: xclawrouter
description: Smart LLM router for OKX — agentic wallet, 55+ models, x402 micropayments on Base + Solana. Routes every request to the cheapest capable model. 11 free NVIDIA models included.
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

Smart LLM router that saves 67% on inference costs by routing each request to the cheapest model that can handle it. 55+ models across 9 providers (11 free NVIDIA models), all through one wallet.

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

- **SIMPLE** (40% of traffic) — factual lookups, greetings, translations → Gemini Flash ($0.60/M, 99% savings)
- **MEDIUM** (30%) — summaries, explanations, data extraction → DeepSeek Chat ($0.42/M, 99% savings)
- **COMPLEX** (20%) — code generation, multi-step analysis → Claude Opus ($75/M, best quality)
- **REASONING** (10%) — proofs, formal logic, multi-step math → o3 ($8/M, 89% savings)

Rules handle ~80% of requests in <1ms. Only ambiguous queries hit the LLM classifier (~$0.00003 per classification).

## Available Models

55+ models including: gpt-5.5, gpt-5.4, gpt-4o, o3, claude-opus-4.8, claude-opus-4.7, claude-sonnet-4.6, gemini-3.1-pro, gemini-3.5-flash, deepseek-v4-pro, deepseek-chat, grok-4.3, grok-build-0.1, kimi-k2.6, kimi-k2.5, and free NVIDIA-hosted models (gpt-oss-120b [default], gpt-oss-20b, mistral-small-4-119b, deepseek-v4-flash, qwen3-next-80b-a3b-thinking, qwen3-coder-480b, glm-4.7, llama-4-maverick, nemotron-3-nano-omni-30b-a3b-reasoning [vision]).

## Example Output

```
[XClawRouter] google/gemini-2.5-flash (SIMPLE, rules, confidence=0.92)
             Cost: $0.0025 | Baseline: $0.308 | Saved: 99.2%
```
