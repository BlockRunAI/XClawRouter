<div align="center">

<img src="assets/banner.png" alt="ClawRouter Banner" width="600">

<h1>The LLM router built for autonomous agents</h1>

<p>Use one BlockRun account API key or let an agent settle each request over x402.<br><br>
<strong>Local smart routing across <!-- br:models.chatVisible -->76<!-- /br:models.chatVisible --> models.</strong><br><br>
<em><!-- br:models.free -->7<!-- /br:models.free --> models free, no crypto required.</em></p>

<br>

<img src="https://img.shields.io/badge/🆓_7_Free_Models-success?style=for-the-badge" alt="7 free models">&nbsp;
<img src="https://img.shields.io/badge/🤖_Agent--Native-black?style=for-the-badge" alt="Agent native">&nbsp;
<img src="https://img.shields.io/badge/🔑_Account_API_Keys-blue?style=for-the-badge" alt="Account API keys">&nbsp;
<img src="https://img.shields.io/badge/⚡_Local_Routing-yellow?style=for-the-badge" alt="Local routing">&nbsp;
<img src="https://img.shields.io/badge/💰_x402_USDC-purple?style=for-the-badge" alt="x402 USDC">&nbsp;
<img src="https://img.shields.io/badge/🔓_Open_Source-green?style=for-the-badge" alt="Open source">

[![npm version](https://img.shields.io/npm/v/@blockrun/xclawrouter.svg?style=flat-square&color=cb3837)](https://npmjs.com/package/@blockrun/xclawrouter)
[![npm downloads](https://img.shields.io/npm/dm/@blockrun/xclawrouter.svg?style=flat-square&color=blue)](https://npmjs.com/package/@blockrun/xclawrouter)
[![GitHub stars](https://img.shields.io/github/stars/BlockRunAI/XClawRouter?style=flat-square&label=GitHub%20stars)](https://github.com/BlockRunAI/XClawRouter)
[![CI](https://img.shields.io/github/actions/workflow/status/BlockRunAI/XClawRouter/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/BlockRunAI/XClawRouter/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[![USDC Hackathon Winner](https://img.shields.io/badge/🏆_USDC_Hackathon-Agentic_Commerce_Winner-gold?style=flat-square)](https://x.com/USDC/status/2021625822294216977)
[![x402 Protocol](https://img.shields.io/badge/x402-Micropayments-purple?style=flat-square)](https://x402.org)
[![Solana](https://img.shields.io/badge/Solana-USDC-9945FF?style=flat-square&logo=solana&logoColor=white)](https://solana.com)
[![Base Network](https://img.shields.io/badge/Base-USDC-0052FF?style=flat-square&logo=coinbase&logoColor=white)](https://base.org)
[![OpenClaw Plugin](https://img.shields.io/badge/OpenClaw-Plugin-orange?style=flat-square)](https://openclaw.ai)
[![Telegram](https://img.shields.io/badge/Telegram-Community-26A5E4?style=flat-square&logo=telegram)](https://t.me/blockrunAI)

</div>

> **XClawRouter** is an open-source smart LLM router that reduces AI API costs by <!-- br:savings.autoVsBaselinePct -->84<!-- /br:savings.autoVsBaselinePct -->%. It analyzes each request across 15 dimensions and routes locally to the cheapest capable model in under 1ms. Use a BlockRun account API key with prepaid credit, or settle requests with USDC over x402 on Solana or Base. <!-- br:models.chatVisible -->76<!-- /br:models.chatVisible --> models from OpenAI, Anthropic, Google, xAI, DeepSeek, and more. MIT licensed.

---

## Why ClawRouter exists

XClawRouter supports both teams that want a familiar account API and agents that pay autonomously:

- **Starts at $0** — 7 NVIDIA models are free forever (incl. 1M-context DeepSeek V4 + a vision-capable Nemotron Omni)
- **One account API key** — prepaid BlockRun credit across supported products
- **Optional x402 wallet** — the wallet signature is authentication
- **No model selection** — 15-dimension scoring picks the right model automatically
- **No credit cards** — agents pay per-request with USDC via [x402](https://x402.org)
- **No trust required** — runs locally, <1ms routing, zero external dependencies

Both modes use the same local router and model IDs.

---

## How it compares

|                  | OpenRouter        | LiteLLM          | Martian           | Portkey           | **ClawRouter**                                                         |
| ---------------- | ----------------- | ---------------- | ----------------- | ----------------- | ---------------------------------------------------------------------- |
| **Models**       | 200+              | 100+             | Smart routing     | Gateway           | **60+**                                                                |
| **Free tier**    | Rate-limited      | BYO keys         | No                | No                | **<!-- br:models.free -->7<!-- /br:models.free --> models, no signup** |
| **Routing**      | Manual selection  | Manual selection | Smart (closed)    | Observability     | **Smart (open source)**                                                |
| **Auth**         | Account + API key | Your API keys    | Account + API key | Account + API key | **BlockRun API key or wallet signature**                               |
| **Payment**      | Credit card       | BYO keys         | Credit card       | $49-499/mo        | **Account credit or USDC per-request**                                 |
| **Runs locally** | No                | Yes              | No                | No                | **Yes**                                                                |
| **Open source**  | No                | Yes              | No                | Partial           | **Yes**                                                                |
| **Agent-ready**  | No                | No               | No                | No                | **Yes**                                                                |

✓ Open source · ✓ Smart routing · ✓ Runs locally · ✓ Crypto native · ✓ Agent ready

**We're the only one that checks all five boxes.**

---

## Quick Start

> **Recommended:** [create a BlockRun account](https://user.blockrun.ai), [create an API key](https://user.blockrun.ai/dashboard/keys), and [add credits](https://user.blockrun.ai/dashboard/credits). Export the key as `BLOCKRUN_API_KEY`; XClawRouter will use it instead of a wallet.

### Option A — OpenClaw Agent

[OpenClaw](https://openclaw.ai) is an AI coding agent. If you're using it, XClawRouter installs as a plugin. Three install paths — pick whichever fits:

**1. One-liner (recommended)** — installs the plugin, bootstraps onchainos, and points you at the wallet login command:

```bash
curl -fsSL https://blockrun.ai/XClawRouter-update | bash
export BLOCKRUN_API_KEY=brk_...
openclaw gateway restart
```

**2. Manual via OpenClaw plugin manager** — if you want to see each step:

```bash
openclaw plugins install @blockrun/xclawrouter
openclaw plugins enable xclawrouter    # add to plugins.allow so the gateway loads it
export BLOCKRUN_API_KEY=brk_...
openclaw gateway restart
```

**3. Global npm install** — same effect as #2, useful for CI or pinned deployments:

```bash
npm install -g @blockrun/xclawrouter
openclaw plugins enable xclawrouter    # add to plugins.allow so the gateway loads it
export BLOCKRUN_API_KEY=brk_...
openclaw gateway restart
```

For x402 instead, omit `BLOCKRUN_API_KEY` and run `npx @blockrun/xclawrouter setup` to connect an OKX Agentic Wallet. Local wallet users can choose Solana before Base.

Done. Smart routing (`blockrun/auto`) is now your default model.

### Option B — Standalone (continue.dev, Cursor, VS Code, any OpenAI-compatible client)

> **Using Claude Code?** Check out [BRCC](https://blockrun.ai/brcc.md) — it's purpose-built for Claude Code with the same smart routing and x402 payments.

No OpenClaw required. XClawRouter runs as a local proxy on port 8402.

**1. Start the proxy**

```bash
export BLOCKRUN_API_KEY=brk_...
npx @blockrun/xclawrouter
```

**2. Fund your account or wallet**

Account users add prepaid credit at [user.blockrun.ai/dashboard/credits](https://user.blockrun.ai/dashboard/credits). For x402, fund USDC on Solana or Base. To stay at $0, pin a free model such as `free/nemotron-3.5-lightning`.

**3. Point your client at `http://localhost:8402`**

<details>
<summary><strong>continue.dev</strong> — <code>~/.continue/config.yaml</code></summary>

> **Important:** `apiBase` must end with `/v1/` (including the trailing slash). Without it, continue.dev constructs the URL as `/chat/completions` instead of `/v1/chat/completions`, and the proxy returns 404.

```yaml
models:
  - name: ClawRouter Auto
    provider: openai
    model: blockrun/auto
    apiBase: http://localhost:8402/v1/
    apiKey: x402
    roles:
      - chat
      - edit
      - apply
```

To pin a specific model, replace `blockrun/auto` with any model from [blockrun.ai/models](https://blockrun.ai/models), e.g. `anthropic/claude-opus-5`, `xai/grok-4.5`.

Both `provider: openai` and `provider: clawrouter` work — just make sure `apiBase` ends with `/v1/`.

<details>
<summary>Legacy JSON format (<code>~/.continue/config.json</code>)</summary>

```json
{
  "models": [
    {
      "title": "ClawRouter Auto",
      "provider": "openai",
      "model": "blockrun/auto",
      "apiBase": "http://localhost:8402/v1/",
      "apiKey": "x402"
    }
  ]
}
```

</details>
</details>

<details>
<summary><strong>Cursor</strong> — Settings → Models → OpenAI-compatible</summary>

Set base URL to `http://localhost:8402`, API key to `x402`, model to `blockrun/auto`.

</details>

<details>
<summary><strong>Any OpenAI SDK</strong></summary>

```python
from openai import OpenAI
client = OpenAI(base_url="http://localhost:8402", api_key="x402")
response = client.chat.completions.create(model="blockrun/auto", messages=[...])
```

</details>

---

## Routing Profiles

Choose your routing strategy with `/model <profile>`:

| Profile          | Strategy           | Savings  | Best For             |
| ---------------- | ------------------ | -------- | -------------------- |
| `/model free`    | Free NVIDIA models | **100%** | $0 balance, learning |
| `/model auto`    | Balanced (default) | 74-100%  | General use          |
| `/model eco`     | Cheapest possible  | 95-100%  | Maximum savings      |
| `/model premium` | Best quality       | 0%       | Mission-critical     |

**Shortcuts:** `/model grok`, `/model br-sonnet`, `/model gpt5`, `/model o3`

---

## How It Works

**100% local routing. <1ms latency. Zero external API calls.**

```
Request → Weighted Scorer (15 dimensions) → Tier → Best Model → Response
```

| Tier      | ECO Model                              | AUTO Model                      | PREMIUM Model              |
| --------- | -------------------------------------- | ------------------------------- | -------------------------- |
| SIMPLE    | free/nemotron-3.5-lightning (**FREE**) | gemini-2.5-flash ($0.3/$2.5)    | kimi-k3 ($3/$15)           |
| MEDIUM    | gemini-3.1-flash-lite ($0.25/$1.5)     | kimi-k3 ($3/$15)                | gpt-5.3-codex ($1.75/$14)  |
| COMPLEX   | gemini-3.1-flash-lite ($0.25/$1.5)     | gemini-3.1-pro ($2/$12)         | claude-opus-4.8 ($5/$25)   |
| REASONING | deepseek-reasoner ($0.14/$0.28)        | deepseek-reasoner ($0.14/$0.28) | claude-sonnet-4.6 ($3/$15) |

**Blended average: $2.05/M** vs $25/M for Claude Opus = **<!-- br:savings.autoVsBaselinePct -->84<!-- /br:savings.autoVsBaselinePct -->% savings**

---

## Image Generation

Generate images directly from chat with `/imagegen`:

```
/imagegen a dog dancing on the beach
/imagegen --model dall-e-3 a futuristic city at sunset
/imagegen --model banana-pro --size 2048x2048 mountain landscape
```

| Model                        | Provider              | Price        | Max Size  |
| ---------------------------- | --------------------- | ------------ | --------- |
| `nano-banana`                | Google Gemini Flash   | $0.05/image  | 1024x1024 |
| `banana-pro`                 | Google Gemini Pro     | $0.10/image  | 4096x4096 |
| `dall-e-3`                   | OpenAI DALL-E 3       | $0.04/image  | 1792x1024 |
| `gpt-image`                  | OpenAI GPT Image 1    | $0.02/image  | 1536x1024 |
| `flux`                       | Black Forest Flux 1.1 | $0.04/image  | 1024x1024 |
| `xai/grok-imagine-image`     | xAI Grok Imagine      | $0.02/image  | 1024x1024 |
| `xai/grok-imagine-image-pro` | xAI Grok Imagine Pro  | $0.07/image  | 1024x1024 |
| `zai/cogview-4`              | Zhipu CogView-4       | $0.015/image | 1440x1440 |

## Video Generation

Generate short AI videos directly from chat with `/videogen`:

```
/videogen a red apple slowly spinning
/videogen --model seedance-2-fast --duration=5 a cat waving
/videogen --model grok-video a neon city at night
```

Or drive it over HTTP — ClawRouter proxies the BlockRun gateway, handles x402 payment, and downloads the returned MP4 to local disk, rewriting `url` to `http://localhost:8402/videos/<file>.mp4` so the asset survives past the upstream's temporary bucket.

```bash
curl -X POST http://localhost:8402/v1/videos/generations \
  -H "Content-Type: application/json" \
  -d '{"model":"bytedance/seedance-2.0-fast","prompt":"a red apple slowly spinning","duration_seconds":5}'
```

| Model                         | Provider           | Price     | Duration              |
| ----------------------------- | ------------------ | --------- | --------------------- |
| `bytedance/seedance-1.5-pro`  | ByteDance Seedance | $0.03/sec | 5s default, up to 10s |
| `bytedance/seedance-2.0-fast` | ByteDance Seedance | $0.15/sec | 5s default, up to 10s |
| `bytedance/seedance-2.0`      | ByteDance Seedance | $0.30/sec | 5s default, up to 10s |
| `xai/grok-imagine-video`      | xAI Grok Imagine   | $0.05/sec | 8s default            |

Calls block for 30–120s while the upstream polls the job. Text-to-video and image-to-video (`image_url` parameter) are both supported. Seedance 2.0 Fast typically returns in 60–80s; 2.0 Pro trades latency for quality.

## Image Editing (img2img)

Edit existing images with `/img2img`:

```
/img2img --image ~/photo.png change the background to a starry sky
/img2img --image ./cat.jpg --mask ./mask.png remove the background
```

| Option            | Required | Description                           |
| ----------------- | -------- | ------------------------------------- |
| `--image <path>`  | Yes      | Local image file path (supports `~/`) |
| `--mask <path>`   | No       | Mask image (white = area to edit)     |
| `--model <model>` | No       | Model to use (default: `gpt-image-1`) |
| `--size <WxH>`    | No       | Output size (default: `1024x1024`)    |

**API endpoint:** `POST http://localhost:8402/v1/images/image2image` — see [full docs](docs/image-generation.md#post-v1imagesimage2image).

---

## Models & Pricing

<!-- br:models.chatVisible -->76<!-- /br:models.chatVisible --> models across 9 providers, one BlockRun API key or x402 wallet. **Starting at $0.0002/request.**

> **💡 "Cost per request"** = estimated cost for a typical chat message (~500 input + 500 output tokens).

### Budget Models (under $0.001/request)

| Model                                       | Input $/M | Output $/M | ~$/request | Context | Features                                     |
| ------------------------------------------- | --------: | ---------: | ---------: | ------- | -------------------------------------------- |
| free/nemotron-3.5-lightning                 |  **FREE** |   **FREE** |     **$0** | 1M      | reasoning — default free model               |
| free/nemotron-3-nano-30b                    |  **FREE** |   **FREE** |     **$0** | 131K    | reasoning, fastest free model (~121 tok/s)   |
| free/laguna-xs-2.1                          |  **FREE** |   **FREE** |     **$0** | 131K    | coding                                       |
| free/north-mini-code                        |  **FREE** |   **FREE** |     **$0** | 256K    | coding                                       |
| free/nemotron-3-nano-omni-30b-a3b-reasoning |  **FREE** |   **FREE** |     **$0** | 256K    | reasoning, **vision** (text+img+video+audio) |
| free/nemotron-3-ultra-550b                  |  **FREE** |   **FREE** |     **$0** | 1M      | reasoning                                    |
| free/llama-3.2-11b-vision                   |  **FREE** |   **FREE** |     **$0** | 128K    | **vision**                                   |
| openai/gpt-4.1-nano                         |     $0.10 |      $0.40 |    $0.0003 | 128K    | tools                                        |
| google/gemini-2.5-flash-lite                |     $0.10 |      $0.40 |    $0.0003 | 1M      | tools                                        |
| openai/gpt-4o-mini                          |     $0.15 |      $0.60 |    $0.0004 | 128K    | tools                                        |
| openai/gpt-5.4-nano                         |     $0.20 |      $1.25 |    $0.0007 | 1M      | tools                                        |
| openai/gpt-5-mini                           |     $0.25 |      $2.00 |    $0.0011 | 200K    | tools                                        |
| google/gemini-3.1-flash-lite                |     $0.25 |      $1.50 |    $0.0009 | 1M      | tools                                        |
| deepseek/deepseek-chat                      |     $0.20 |      $0.40 |    $0.0003 | 1M      | tools (V4 Flash chat)                        |
| deepseek/deepseek-reasoner                  |     $0.20 |      $0.40 |    $0.0003 | 1M      | reasoning, tools (V4 Flash thinking)         |
| deepseek/deepseek-v4-pro                    |    $0.435 |      $0.87 |    $0.0007 | 1M      | reasoning, agentic, tools (V4 flagship)      |
| zai/glm-5                                   |     $0.60 |      $1.92 |    $0.0013 | 200K    | tools                                        |
| zai/glm-5-turbo                             |     $1.20 |      $4.00 |    $0.0026 | 200K    | tools                                        |
| minimax/minimax-m3                          |     $0.30 |      $1.20 |    $0.0008 | 1M      | reasoning, agentic, tools                    |
| minimax/minimax-m2.7                        |     $0.30 |      $1.20 |    $0.0008 | 205K    | reasoning, agentic, tools                    |
| google/gemini-2.5-flash                     |     $0.30 |      $2.50 |    $0.0014 | 1M      | vision, tools                                |
| openai/gpt-4.1-mini                         |     $0.40 |      $1.60 |    $0.0010 | 128K    | tools                                        |
| google/gemini-3.5-flash                     |     $0.50 |      $3.00 |    $0.0018 | 1M      | reasoning, vision, tools (thinking built-in) |
| google/gemini-3-flash-preview               |     $0.50 |      $3.00 |    $0.0018 | 1M      | vision                                       |
| xiaomi/mimo-v2.5                            |     $0.14 |      $0.28 |    $0.0003 | 1M      | reasoning, vision, tools                     |
| qwen/qwen3.8-flash                          |     $0.15 |      $0.47 |    $0.0003 | 1M      | reasoning, vision, tools                     |
| tencent/hy3                                 |     $0.13 |      $0.53 |    $0.0003 | 262K    | reasoning, tools                             |
| zai/glm-5.3-flash                           |     $0.15 |      $0.50 |    $0.0003 | 1M      | reasoning, vision, tools                     |
| openai/gpt-5.6-luna                         |     $0.20 |      $1.20 |    $0.0007 | 1M      | vision, agentic, tools                       |
| xiaomi/mimo-v2.5-pro                        |     $0.43 |      $0.87 |    $0.0008 | 1M      | reasoning, tools                             |
| deepseek/deepseek-v4-flash-vision-exp       |     $0.44 |      $1.32 |    $0.0010 | 1M      | reasoning, vision, tools                     |

### Mid-Range Models ($0.001–$0.01/request)

| Model                        | Input $/M | Output $/M | ~$/request | Context | Features                                  |
| ---------------------------- | --------: | ---------: | ---------: | ------- | ----------------------------------------- |
| openai/gpt-5.4-mini          |     $0.75 |      $4.50 |    $0.0026 | 400K    | vision, agentic, tools                    |
| anthropic/claude-haiku-4.5   |     $1.00 |      $5.00 |    $0.0030 | 200K    | vision, agentic, tools                    |
| openai/o3-mini               |     $1.10 |      $4.40 |    $0.0028 | 128K    | reasoning, tools                          |
| openai/o4-mini               |     $1.10 |      $4.40 |    $0.0028 | 128K    | reasoning, tools                          |
| google/gemini-2.5-pro        |     $1.25 |     $10.00 |    $0.0056 | 1M      | reasoning, vision, tools                  |
| zai/glm-5.1                  |     $1.40 |      $4.40 |    $0.0029 | 200K    | reasoning, tools (promo ended 2026-06-05) |
| xai/grok-4.3                 |     $1.25 |      $2.50 |    $0.0019 | 1M      | reasoning, vision, agentic, tools         |
| xai/grok-build-0.1           |     $1.00 |      $2.00 |    $0.0015 | 256K    | agentic coding, tools                     |
| openai/gpt-5.2               |     $1.75 |     $14.00 |    $0.0079 | 400K    | reasoning, vision, agentic, tools         |
| openai/gpt-5.3-codex         |     $1.75 |     $14.00 |    $0.0079 | 400K    | agentic, tools                            |
| openai/gpt-4.1               |     $2.00 |      $8.00 |    $0.0050 | 128K    | vision, tools                             |
| openai/o3                    |     $2.00 |      $8.00 |    $0.0050 | 200K    | reasoning, tools                          |
| google/gemini-3.1-pro        |     $2.00 |     $12.00 |    $0.0070 | 1M      | reasoning, vision, tools                  |
| openai/gpt-4o                |     $2.50 |     $10.00 |    $0.0063 | 128K    | vision, agentic, tools                    |
| openai/gpt-5.4               |     $2.50 |     $15.00 |    $0.0088 | 400K    | reasoning, vision, agentic, tools         |
| google/gemini-3.5-flash-lite |     $0.30 |      $2.50 |    $0.0013 | 1M      | reasoning, tools                          |
| zai/glm-5.2                  |     $1.40 |      $4.40 |    $0.0032 | 1M      | reasoning, tools                          |
| zai/glm-5.3                  |     $1.40 |      $4.40 |    $0.0032 | 1M      | reasoning, tools                          |
| qwen/qwen3.7-max             |     $1.48 |      $4.42 |    $0.0032 | 1M      | reasoning, agentic, tools                 |
| google/gemini-3.6-flash      |     $1.50 |      $7.50 |    $0.0045 | 1M      | reasoning, vision, tools                  |
| xai/grok-4.5                 |     $2.00 |      $6.00 |    $0.0040 | 500K    | reasoning, vision, agentic, tools         |
| openai/gpt-5.6-terra         |     $2.00 |     $12.00 |    $0.0068 | 1M      | reasoning, vision, agentic, tools         |
| anthropic/claude-sonnet-5    |     $3.00 |     $15.00 |    $0.0090 | 1M      | reasoning, vision, agentic, tools         |
| moonshot/kimi-k3             |     $3.00 |     $15.00 |    $0.0090 | 1M      | reasoning, vision, agentic, tools         |

### Premium Models ($0.01+/request)

| Model                       | Input $/M | Output $/M | ~$/request | Context | Features                          |
| --------------------------- | --------: | ---------: | ---------: | ------- | --------------------------------- |
| anthropic/claude-sonnet-4.6 |     $3.00 |     $15.00 |    $0.0090 | 200K    | reasoning, vision, agentic, tools |
| anthropic/claude-opus-4.8   |     $5.00 |     $25.00 |    $0.0150 | 1M      | reasoning, vision, agentic, tools |
| anthropic/claude-opus-4.7   |     $5.00 |     $25.00 |    $0.0150 | 1M      | reasoning, vision, agentic, tools |
| openai/gpt-5.5              |     $5.00 |     $30.00 |    $0.0175 | 1M      | reasoning, vision, agentic, tools |
| openai/o1                   |    $15.00 |     $60.00 |    $0.0375 | 200K    | reasoning, tools                  |
| openai/gpt-5.2-pro          |    $21.00 |    $168.00 |    $0.0945 | 400K    | reasoning, tools                  |
| openai/gpt-5.4-pro          |    $30.00 |    $180.00 |    $0.1050 | 400K    | reasoning, tools                  |
| anthropic/claude-opus-4.5   |     $5.00 |     $25.00 |    $0.0150 | 200K    | reasoning, vision, agentic, tools |
| anthropic/claude-opus-5     |     $5.00 |     $25.00 |    $0.0150 | 1M      | reasoning, vision, agentic, tools |
| openai/gpt-5.6-sol          |     $5.00 |     $30.00 |    $0.0170 | 1M      | reasoning, vision, agentic, tools |
| anthropic/claude-fable-5    |    $10.00 |     $50.00 |    $0.0300 | 1M      | reasoning, vision, agentic, tools |
| openai/gpt-5.5-pro          |    $30.00 |    $180.00 |    $0.1020 | 1M      | reasoning, vision, tools          |

> **Free tier:** <!-- br:models.free -->7<!-- /br:models.free --> models cost nothing — `/model free` points to nemotron-3.5-lightning, or pick any free model directly (e.g., `/model nemotron-omni` for vision, `/model north-mini-code` for coding, `/model nemotron-3-ultra-550b` for reasoning + 1M context).
> **Best value:** `xiaomi/mimo-v2.5`, `qwen/qwen3.8-flash` and `zai/glm-5.3-flash` deliver strong results at ~$0.0003/request.

---

## Authentication and payment

**Account API (recommended):** send `BLOCKRUN_API_KEY` as a bearer token to `https://api.blockrun.ai/v1`. XClawRouter handles this when the variable or `apiKey` plugin setting is present. Manage keys at [user.blockrun.ai/dashboard/keys](https://user.blockrun.ai/dashboard/keys) and credit at [user.blockrun.ai/dashboard/credits](https://user.blockrun.ai/dashboard/credits).

**x402 wallet:** payment is authentication via [x402](https://x402.org).

```
Request → 402 (price: $0.003) → wallet signs USDC → retry → response
```

USDC stays in your wallet until spent — non-custodial. Price is visible in the 402 header before signing.

**Dual-chain support:** Pay with **USDC on Solana** or **USDC on Base (EVM)**. Both wallets are derived from a single BIP-39 mnemonic on first run.

```bash
/wallet              # Check balance and address (both chains)
/wallet export       # Export mnemonic + keys for backup
/wallet recover      # Restore wallet from mnemonic on a new machine
/wallet solana       # Switch to Solana USDC payments
/wallet base         # Switch back to Base (EVM) USDC payments
/chain solana        # Alias for /wallet solana
/stats               # View usage and savings
/stats clear         # Reset usage statistics
/exclude             # Show excluded models
/exclude add <model> # Block a model from routing (aliases work: "grok-4", "free")
/exclude remove <model> # Unblock a model
/exclude clear       # Remove all exclusions
```

**Fund your wallet:**

- **Solana:** Send USDC on Solana to your Solana address
- **Base (EVM):** Send USDC on Base to your EVM address
- **Coinbase/CEX:** Withdraw USDC to either network
- **Credit card:** Reach out to [@bc1max on Telegram](https://t.me/bc1max)

---

## Screenshots

<table>
<tr>
<td width="50%" align="center">
<strong>Smart Routing in Action</strong><br><br>
<img src="docs/clawrouter-savings.png" alt="ClawRouter savings" width="400">
</td>
<td width="50%" align="center">
<strong>Telegram Integration</strong><br><br>
<img src="assets/telegram-demo.png" alt="Telegram demo" width="400">
</td>
</tr>
</table>

---

## Configuration

For basic usage, no configuration needed. For advanced options:

| Variable                    | Default                               | Description                                      |
| --------------------------- | ------------------------------------- | ------------------------------------------------ |
| `BLOCKRUN_API_KEY`          | unset                                 | Account API key; takes priority over wallet mode |
| `BLOCKRUN_API_BASE_URL`     | `https://api.blockrun.ai`             | Account API root for staging/private deployments |
| `BLOCKRUN_WALLET_KEY`       | auto-generated                        | x402 wallet private key                          |
| `BLOCKRUN_PROXY_PORT`       | `8402`                                | Local proxy port                                 |
| `CLAWROUTER_DISABLED`       | `false`                               | Disable smart routing                            |
| `CLAWROUTER_SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` | Solana RPC endpoint                              |

**Full reference:** [docs/configuration.md](docs/configuration.md)

### Model Exclusion

Block specific models from being routed to. Useful if a model doesn't follow your agent instructions or you want to control costs.

```bash
/exclude add free/nemotron-3.5-lightning   # Block the default free model
/exclude add grok-4                # Aliases work — blocks all grok-4 variants
/exclude add gpt-5.4               # Skip expensive models
/exclude                           # Show current exclusions
/exclude remove grok-4             # Unblock a model
/exclude clear                     # Remove all exclusions
```

Exclusions persist across restarts (`~/.openclaw/blockrun/exclude-models.json`). If all models in a tier are excluded, the safety net ignores the filter so routing never breaks.

---

## Troubleshooting

**When things go wrong, run the doctor:**

```bash
npx @blockrun/xclawrouter doctor
```

This collects diagnostics and sends them to Claude Sonnet for AI-powered analysis:

```
🩺 BlockRun Doctor v0.12.24

System
  ✓ OS: darwin arm64
  ✓ Node: v20.11.0

Wallet
  ✓ Address: 0x1234...abcd
  ✓ Balance: $12.50

Network
  ✓ BlockRun API: reachable (142ms)
  ✗ Local proxy: not running on :8402

📤 Sending to Claude Sonnet 4.6 (~$0.003)...

🤖 AI Analysis:
The local proxy isn't running. Run `openclaw gateway restart` to fix.
```

**Use Opus for complex issues:**

```bash
npx @blockrun/xclawrouter doctor opus
```

**Ask a specific question:**

```bash
npx @blockrun/xclawrouter doctor "why is my request failing?"
npx @blockrun/xclawrouter doctor opus "深度分析我的配置"
```

**Cost:** Sonnet ~$0.003 (default) | Opus ~$0.01

---

## Development

```bash
git clone https://github.com/BlockRunAI/XClawRouter.git
cd ClawRouter
npm install
npm run build
npm test
```

---

## Support

| Channel               | Link                                                               |
| --------------------- | ------------------------------------------------------------------ |
| 📅 Schedule Demo      | [calendly.com/vickyfu9/30min](https://calendly.com/vickyfu9/30min) |
| 💬 Community Telegram | [t.me/blockrunAI](https://t.me/blockrunAI)                         |
| 🐦 X / Twitter        | [x.com/blockrunai](https://x.com/blockrunai)                       |
| 📱 Founder Telegram   | [@bc1max](https://t.me/bc1max)                                     |
| ✉️ Email              | vicky@blockrun.ai                                                  |

---

## From the BlockRun Ecosystem

<table>
<tr>
<td width="50%">

### ⚡ ClawRouter

**The LLM router built for autonomous agents**

You're here. <!-- br:models.chatVisible -->76<!-- /br:models.chatVisible --> models, local smart routing, x402 USDC payments — the only stack that lets agents operate independently.

`curl -fsSL https://blockrun.ai/XClawRouter-update | bash`

</td>
<td width="50%">

### 🤖 [BRCC](https://blockrun.ai/brcc.md)

**BlockRun for Claude Code**

Run Claude Code with <!-- br:models.chatVisible -->76<!-- /br:models.chatVisible --> models, no rate limits, no Anthropic account, no phone verification. Pay per request with USDC — your wallet is your identity.

`curl -fsSL https://blockrun.ai/brcc-install | bash`

</td>
</tr>
</table>

---

## More Resources

| Resource                                               | Description              |
| ------------------------------------------------------ | ------------------------ |
| [Documentation](https://blockrun.ai/docs)              | Full docs                |
| [Model Pricing](https://blockrun.ai/models)            | All models & prices      |
| [Image Generation & Editing](docs/image-generation.md) | API examples, 5 models   |
| [Routing Profiles](docs/routing-profiles.md)           | ECO/AUTO/PREMIUM details |
| [Architecture](docs/architecture.md)                   | Technical deep dive      |
| [Configuration](docs/configuration.md)                 | Environment variables    |
| [Troubleshooting](docs/troubleshooting.md)             | Common issues            |

### Blog

| Article                                                                                            | Topic                                                   |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [11 Free AI Models, Zero Cost](docs/11-free-ai-models-zero-cost-blockrun.md)                       | How BlockRun gives developers top-tier LLMs for nothing |
| [ClawRouter Cuts LLM API Costs 500×](docs/clawrouter-cuts-llm-api-costs-500x.md)                   | Deep dive into cost savings                             |
| [ClawRouter vs OpenRouter](docs/clawrouter-vs-openrouter-llm-routing-comparison.md)                | Head-to-head comparison                                 |
| [Smart LLM Router: 14-Dimension Classifier](docs/smart-llm-router-14-dimension-classifier.md)      | How the routing engine works                            |
| [LLM Router Benchmark: 46 Models, Sub-1ms](docs/llm-router-benchmark-46-models-sub-1ms-routing.md) | Performance benchmarks                                  |
| [Anthropic Cost Savings](docs/anthropic-cost-savings.md)                                           | Reducing Claude API spend                               |

---

## Frequently Asked Questions

### What is ClawRouter?

ClawRouter is an open-source (MIT licensed) smart LLM router built for autonomous AI agents. It analyzes each request across 15 dimensions and routes to the cheapest capable model in under 1ms, entirely locally — no external API calls needed for routing decisions.

### How much can ClawRouter save on LLM costs?

ClawRouter's blended average cost is $2.05 per million tokens compared to $25/M for Claude Opus, representing <!-- br:savings.autoVsBaselinePct -->84<!-- /br:savings.autoVsBaselinePct -->% savings. Actual savings depend on your workload — simple queries are routed to free models ($0/request), while complex tasks get premium models.

### How does ClawRouter compare to OpenRouter?

XClawRouter is open source and runs locally. It supports either one BlockRun account API key or autonomous USDC x402 settlement, and automatically picks the best model for each request.

### How does ClawRouter compare to LiteLLM?

Both are open source and run locally. XClawRouter adds automatic model selection and accepts one BlockRun API key or an x402 wallet; LiteLLM typically requires separate provider keys and manual model selection.

### What agents does ClawRouter work with?

ClawRouter works with any tool that makes OpenAI-compatible API calls — point it at `http://localhost:8402`. This includes continue.dev, Cursor, VS Code extensions, ElizaOS, and custom agents. It also integrates as a plugin with [OpenClaw](https://openclaw.ai) (an AI coding agent), which enables additional features like slash commands and usage reports.

### Is ClawRouter free?

ClawRouter itself is free and MIT licensed. You pay only for the LLM API calls routed through it — and several models (`nemotron-3.5-lightning`, `nemotron-3-nano-30b`, `laguna-xs-2.1`, `north-mini-code`, `nemotron-3-nano-omni-30b-a3b-reasoning`, `nemotron-3-ultra-550b`, `llama-3.2-11b-vision`) are completely free. Use `/model free` to smart-route across them, or pick any by name.

---

<div align="center">

**MIT License** · [BlockRun](https://blockrun.ai) — Agent-native AI infrastructure

⭐ If ClawRouter powers your agents, consider starring the repo!

</div>
