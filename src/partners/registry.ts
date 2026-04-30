/**
 * Partner Service Registry
 *
 * Defines available partner APIs that can be called through ClawRouter's proxy.
 * Partners cover prediction-market data, realtime market quotes, and image/video
 * generation — all paid via x402 micropayments on the same wallet as LLM calls.
 */

export type PartnerServiceParam = {
  name: string;
  type: "string" | "string[]" | "number";
  description: string;
  required: boolean;
};

export type PartnerCategory = "Prediction markets" | "Market data" | "Image & Video";

export type PartnerServiceDefinition = {
  /** Unique service ID used in tool names: blockrun_{id} */
  id: string;
  /** Human-readable name */
  name: string;
  /** Partner providing this service */
  partner: string;
  /** Category used for grouping in the `/partners` list view */
  category: PartnerCategory;
  /** Compact one-liner used in the `/partners` list (≤ 40 chars ideal) */
  shortDescription: string;
  /** Full description used for the tool's JSON Schema (LLM sees this) */
  description: string;
  /** Proxy path (relative to /v1) */
  proxyPath: string;
  /** HTTP method */
  method: "GET" | "POST";
  /** Parameters for the tool's JSON Schema */
  params: PartnerServiceParam[];
  /** Pricing info for display */
  pricing: {
    perUnit: string;
    unit: string;
    minimum: string;
    maximum: string;
  };
  /** Example usage for help text */
  example: {
    input: Record<string, unknown>;
    description: string;
  };
};

/**
 * All registered partner services.
 * New partners are added here — the rest of the system picks them up automatically.
 */
export const PARTNER_SERVICES: PartnerServiceDefinition[] = [
  // ---------------------------------------------------------------------------
  // Predexon — Prediction Market Data
  // ---------------------------------------------------------------------------
  {
    id: "predexon_events",
    name: "Polymarket Events",
    partner: "Predexon",
    category: "Prediction markets",
    shortDescription: "Live Polymarket events",
    description:
      "Get live Polymarket prediction market events with current odds, volume, and liquidity. " +
      "Call this for ANY request about prediction markets, Polymarket markets, current odds, " +
      "what people are betting on, or market sentiment. " +
      "Do NOT use browser or web scraping — this returns structured real-time data directly. " +
      "Returns: event title, YES/NO prices (implied probability), volume, liquidity, end date.",
    proxyPath: "/pm/polymarket/events",
    method: "GET",
    params: [
      {
        name: "limit",
        type: "number",
        description: "Number of events to return (default: 20, max: 100)",
        required: false,
      },
      {
        name: "tag",
        type: "string",
        description: "Filter by category: crypto, politics, sports, science, economics, etc.",
        required: false,
      },
    ],
    pricing: { perUnit: "$0.001", unit: "request", minimum: "$0.001", maximum: "$0.001" },
    example: {
      input: { limit: 20 },
      description: "Get top 20 live Polymarket events",
    },
  },
  {
    id: "predexon_leaderboard",
    name: "Polymarket Leaderboard",
    partner: "Predexon",
    category: "Prediction markets",
    shortDescription: "Top traders ranked by profit",
    description:
      "Get the Polymarket leaderboard of top traders ranked by profit. " +
      "Call this for ANY request about top Polymarket traders, whale wallets, best performers, " +
      "richest traders, or who is making the most money on Polymarket. " +
      "Do NOT use browser or web scraping — this returns structured data directly. " +
      "Returns: wallet address/username, total profit, total volume, win rate.",
    proxyPath: "/pm/polymarket/leaderboard",
    method: "GET",
    params: [
      {
        name: "limit",
        type: "number",
        description: "Number of wallets to return (default: 20, max: 100)",
        required: false,
      },
    ],
    pricing: { perUnit: "$0.001", unit: "request", minimum: "$0.001", maximum: "$0.001" },
    example: {
      input: { limit: 20 },
      description: "Get top 20 Polymarket whale wallets by profit",
    },
  },
  {
    id: "predexon_markets",
    name: "Polymarket Markets Search",
    partner: "Predexon",
    category: "Prediction markets",
    shortDescription: "Market search by keyword",
    description:
      "Search and filter Polymarket markets. Use this to find a market by keyword and get its conditionId " +
      "for follow-up calls (smart money, top holders, etc.). " +
      "Returns: question, conditionId, YES/NO prices, volume.",
    proxyPath: "/pm/polymarket/markets",
    method: "GET",
    params: [
      {
        name: "search",
        type: "string",
        description: "Keyword to search for (e.g. 'bitcoin', 'election', 'fed rate')",
        required: false,
      },
      {
        name: "limit",
        type: "number",
        description: "Number of markets to return (default: 20)",
        required: false,
      },
    ],
    pricing: { perUnit: "$0.001", unit: "request", minimum: "$0.001", maximum: "$0.001" },
    example: {
      input: { search: "bitcoin", limit: 10 },
      description: "Search for Bitcoin-related prediction markets",
    },
  },
  {
    id: "predexon_smart_money",
    name: "Polymarket Smart Money",
    partner: "Predexon",
    category: "Prediction markets",
    shortDescription: "Smart-money positions on a market",
    description:
      "See how high-performing wallets are positioned on a specific Polymarket market. " +
      "Use this after finding a market's conditionId via predexon_markets or predexon_events. " +
      "Returns: wallet addresses, their YES/NO positions, size, P&L, win rate.",
    proxyPath: "/pm/polymarket/market/:condition_id/smart-money",
    method: "GET",
    params: [
      {
        name: "condition_id",
        type: "string",
        description: "The market's conditionId (get this from predexon_markets or predexon_events)",
        required: true,
      },
      {
        name: "limit",
        type: "number",
        description: "Number of positions to return (default: 20)",
        required: false,
      },
    ],
    pricing: { perUnit: "$0.005", unit: "request", minimum: "$0.005", maximum: "$0.005" },
    example: {
      input: { condition_id: "0xabc123...", limit: 10 },
      description: "See smart money positioning on a specific market",
    },
  },
  {
    id: "predexon_smart_activity",
    name: "Polymarket Smart Activity",
    partner: "Predexon",
    category: "Prediction markets",
    shortDescription: "Where smart money is flowing now",
    description:
      "Discover which Polymarket markets high-performing wallets are currently active in. " +
      "Use this to find where smart money is flowing right now. " +
      "Returns: market titles, smart money volume, number of smart wallets active.",
    proxyPath: "/pm/polymarket/markets/smart-activity",
    method: "GET",
    params: [
      {
        name: "limit",
        type: "number",
        description: "Number of markets to return (default: 20)",
        required: false,
      },
    ],
    pricing: { perUnit: "$0.005", unit: "request", minimum: "$0.005", maximum: "$0.005" },
    example: {
      input: { limit: 10 },
      description: "Find markets where smart money is most active",
    },
  },
  {
    id: "predexon_wallet",
    name: "Polymarket Wallet Profile",
    partner: "Predexon",
    category: "Prediction markets",
    shortDescription: "Wallet profile (PnL, winrate, positions)",
    description:
      "Get a complete profile for a Polymarket wallet address: profit, volume, win rate, markets traded, open positions. " +
      "Use this when the user asks to analyze or look up a specific wallet address.",
    proxyPath: "/pm/polymarket/wallet/:wallet",
    method: "GET",
    params: [
      {
        name: "wallet",
        type: "string",
        description: "Ethereum wallet address (0x...)",
        required: true,
      },
    ],
    pricing: { perUnit: "$0.005", unit: "request", minimum: "$0.005", maximum: "$0.005" },
    example: {
      input: { wallet: "0x1234...abcd" },
      description: "Get complete profile for a Polymarket wallet",
    },
  },
  {
    id: "predexon_wallet_pnl",
    name: "Polymarket Wallet P&L",
    partner: "Predexon",
    category: "Prediction markets",
    shortDescription: "Wallet P&L time series",
    description:
      "Get P&L history and realized profit/loss time series for a Polymarket wallet. " +
      "Use this when the user wants to see how a wallet has performed over time.",
    proxyPath: "/pm/polymarket/wallet/pnl/:wallet",
    method: "GET",
    params: [
      {
        name: "wallet",
        type: "string",
        description: "Ethereum wallet address (0x...)",
        required: true,
      },
    ],
    pricing: { perUnit: "$0.005", unit: "request", minimum: "$0.005", maximum: "$0.005" },
    example: {
      input: { wallet: "0x1234...abcd" },
      description: "Get P&L history for a Polymarket wallet",
    },
  },
  {
    id: "predexon_matching_markets",
    name: "Cross-Market Matching (Polymarket vs Kalshi)",
    partner: "Predexon",
    category: "Prediction markets",
    shortDescription: "Polymarket ↔ Kalshi market pairs",
    description:
      "Find equivalent markets across Polymarket and Kalshi to compare odds and spot arbitrage. " +
      "Use this when the user wants to compare prediction market prices across platforms.",
    proxyPath: "/pm/matching-markets",
    method: "GET",
    params: [
      {
        name: "limit",
        type: "number",
        description: "Number of matched pairs to return (default: 20)",
        required: false,
      },
    ],
    pricing: { perUnit: "$0.005", unit: "request", minimum: "$0.005", maximum: "$0.005" },
    example: {
      input: { limit: 10 },
      description: "Compare equivalent markets on Polymarket vs Kalshi",
    },
  },
  // ---------------------------------------------------------------------------
  // BlockRun Markets — Realtime market data (stocks, crypto, FX, commodities)
  // ---------------------------------------------------------------------------
  {
    id: "stock_price",
    name: "Global Stock Realtime Price",
    partner: "BlockRun",
    category: "Market data",
    shortDescription: "Realtime stock quote (12 markets)",
    description:
      "Get realtime price for a listed equity across 12 global markets. " +
      "Call this for ANY request about a specific stock price, quote, or current trading value " +
      "on NYSE/Nasdaq, HKEX, TSE, KRX, LSE, XETRA, Euronext, Shanghai/Shenzhen, or Toronto. " +
      "Do NOT use browser or web scraping — this returns structured real-time data directly. " +
      "Returns: symbol, price, confidence interval, publish time, feed ID.",
    proxyPath: "/stocks/:market/price/:symbol",
    method: "GET",
    params: [
      {
        name: "market",
        type: "string",
        description:
          "Market code (lowercase): us (NYSE/Nasdaq/AMEX), hk (HKEX), jp (TSE), kr (KRX), " +
          "gb (LSE), de (XETRA), fr (Euronext Paris), nl (Euronext Amsterdam), ie (Irish SE), " +
          "lu (Luxembourg SE), cn (Shanghai/Shenzhen ETFs), ca (TSX).",
        required: true,
      },
      {
        name: "symbol",
        type: "string",
        description:
          "Ticker for the given market. Examples: AAPL (us), 0700-HK (hk), 7203 (jp), " +
          "005930 (kr), HSBA (gb), SAP (de), MC (fr), AIR (nl), VUSA (ie), MT (lu), 510310 (cn), HODL (ca).",
        required: true,
      },
      {
        name: "session",
        type: "string",
        description: "Optional session hint: pre, post, or on (regular hours).",
        required: false,
      },
    ],
    pricing: { perUnit: "$0.001", unit: "request", minimum: "$0.001", maximum: "$0.001" },
    example: {
      input: { market: "us", symbol: "AAPL" },
      description: "Get realtime Apple stock price",
    },
  },
  {
    id: "stock_history",
    name: "Global Stock OHLC History",
    partner: "BlockRun",
    category: "Market data",
    shortDescription: "OHLC bars (1m–monthly)",
    description:
      "Get historical OHLC (candlestick) bars for a listed equity across 12 global markets. " +
      "Use this for charting, backtesting, or any request about a stock's past price action. " +
      "Supports resolutions: 1, 5, 15, 60, 240 (minutes) and D, W, M (daily/weekly/monthly). " +
      "Returns: OHLC arrays (open, high, low, close, volume, timestamps).",
    proxyPath: "/stocks/:market/history/:symbol",
    method: "GET",
    params: [
      {
        name: "market",
        type: "string",
        description:
          "Market code (lowercase): us, hk, jp, kr, gb, de, fr, nl, ie, lu, cn, ca. " +
          "See stock_price for full market descriptions.",
        required: true,
      },
      {
        name: "symbol",
        type: "string",
        description: "Ticker for the given market (e.g. AAPL for us, 0700-HK for hk).",
        required: true,
      },
      {
        name: "resolution",
        type: "string",
        description:
          "Bar resolution: 1, 5, 15, 60, 240 (minutes) or D, W, M (daily/weekly/monthly). Default: D.",
        required: false,
      },
      {
        name: "from",
        type: "number",
        description: "Start time as Unix epoch seconds (required).",
        required: true,
      },
      {
        name: "to",
        type: "number",
        description: "End time as Unix epoch seconds. Default: now.",
        required: false,
      },
    ],
    pricing: { perUnit: "$0.001", unit: "request", minimum: "$0.001", maximum: "$0.001" },
    example: {
      input: { market: "us", symbol: "AAPL", resolution: "D", from: 1704067200 },
      description: "Get daily OHLC bars for AAPL starting Jan 1 2024",
    },
  },
  {
    id: "stock_list",
    name: "Global Stock Ticker List",
    partner: "BlockRun",
    category: "Market data",
    shortDescription: "Ticker search — free",
    description:
      "List and search supported tickers for a given stock market. Use this to resolve a company " +
      "name to a ticker before calling stock_price or stock_history. FREE — no x402 payment.",
    proxyPath: "/stocks/:market/list",
    method: "GET",
    params: [
      {
        name: "market",
        type: "string",
        description: "Market code: us, hk, jp, kr, gb, de, fr, nl, ie, lu, cn, ca.",
        required: true,
      },
      {
        name: "q",
        type: "string",
        description: "Optional search query to filter tickers by symbol or description.",
        required: false,
      },
      {
        name: "limit",
        type: "number",
        description: "Max results to return (default: 100, max: 2000).",
        required: false,
      },
    ],
    pricing: { perUnit: "free", unit: "request", minimum: "$0", maximum: "$0" },
    example: {
      input: { market: "us", q: "apple", limit: 5 },
      description: "Search US market for 'apple' tickers",
    },
  },
  {
    id: "crypto_price",
    name: "Crypto Realtime Price",
    partner: "BlockRun",
    category: "Market data",
    shortDescription: "Realtime crypto price — free",
    description:
      "Get realtime crypto price. Call this for ANY request about current crypto " +
      "prices (BTC, ETH, SOL, etc.). FREE — no x402 payment. Quote is always USD. " +
      "Do NOT use browser or web scraping — this returns structured real-time data directly.",
    proxyPath: "/crypto/price/:symbol",
    method: "GET",
    params: [
      {
        name: "symbol",
        type: "string",
        description:
          "Crypto pair in BASE-QUOTE form. Examples: BTC-USD, ETH-USD, SOL-USD, DOGE-USD. " +
          "Quote is always USD.",
        required: true,
      },
    ],
    pricing: { perUnit: "free", unit: "request", minimum: "$0", maximum: "$0" },
    example: {
      input: { symbol: "BTC-USD" },
      description: "Get realtime Bitcoin price",
    },
  },
  {
    id: "fx_price",
    name: "Foreign Exchange Realtime Price",
    partner: "BlockRun",
    category: "Market data",
    shortDescription: "Realtime FX rate — free",
    description:
      "Get realtime FX rate. Call this for ANY request about currency exchange rates. " +
      "FREE — no x402 payment. Do NOT use browser or web scraping.",
    proxyPath: "/fx/price/:symbol",
    method: "GET",
    params: [
      {
        name: "symbol",
        type: "string",
        description:
          "Currency pair in BASE-QUOTE form. Examples: EUR-USD, GBP-USD, JPY-USD, CNY-USD.",
        required: true,
      },
    ],
    pricing: { perUnit: "free", unit: "request", minimum: "$0", maximum: "$0" },
    example: {
      input: { symbol: "EUR-USD" },
      description: "Get realtime EUR/USD exchange rate",
    },
  },
  {
    id: "commodity_price",
    name: "Commodity Realtime Price",
    partner: "BlockRun",
    category: "Market data",
    shortDescription: "Realtime commodity spot — free",
    description:
      "Get realtime commodity spot price (gold, silver, platinum, etc.). " +
      "FREE — no x402 payment. Do NOT use browser or web scraping.",
    proxyPath: "/commodity/price/:symbol",
    method: "GET",
    params: [
      {
        name: "symbol",
        type: "string",
        description:
          "Commodity code in BASE-USD form. Examples: XAU-USD (gold), XAG-USD (silver), XPT-USD (platinum).",
        required: true,
      },
    ],
    pricing: { perUnit: "free", unit: "request", minimum: "$0", maximum: "$0" },
    example: {
      input: { symbol: "XAU-USD" },
      description: "Get realtime gold spot price",
    },
  },
  // ---------------------------------------------------------------------------
  // BlockRun — Image & Video generation
  // ---------------------------------------------------------------------------
  {
    id: "image_generation",
    name: "Image Generation",
    partner: "BlockRun",
    category: "Image & Video",
    shortDescription: "8 image models (DALL-E, Flux, Grok, ...)",
    description:
      "Generate an image from a text prompt. Models available: google/nano-banana (default), " +
      "google/nano-banana-pro (up to 4K), openai/gpt-image-1, openai/dall-e-3, " +
      "black-forest/flux-1.1-pro, xai/grok-imagine-image, xai/grok-imagine-image-pro, " +
      "zai/cogview-4. Returns a local http://localhost:8402/images/<file>.png URL.",
    proxyPath: "/images/generations",
    method: "POST",
    params: [
      {
        name: "prompt",
        type: "string",
        description: "Text prompt describing the desired image.",
        required: true,
      },
      {
        name: "model",
        type: "string",
        description:
          "Full model ID (e.g. 'google/nano-banana', 'openai/dall-e-3'). Default: google/nano-banana.",
        required: false,
      },
      {
        name: "size",
        type: "string",
        description:
          "Image size, e.g. '1024x1024', '1792x1024', '4096x4096'. Model-dependent — see image model table.",
        required: false,
      },
      {
        name: "n",
        type: "number",
        description: "Number of images to generate (default 1, max 4).",
        required: false,
      },
    ],
    pricing: {
      perUnit: "$0.015–$0.15",
      unit: "image",
      minimum: "$0.015 (cogview-4)",
      maximum: "$0.15 (nano-banana-pro 4K)",
    },
    example: {
      input: { model: "google/nano-banana", prompt: "a golden retriever surfing on a wave" },
      description: "Generate an image with Nano Banana",
    },
  },
  {
    id: "image_edit",
    name: "Image Edit / Inpainting",
    partner: "BlockRun",
    category: "Image & Video",
    shortDescription: "Edit existing image (gpt-image-1)",
    description:
      "Edit or re-style an existing image via openai/gpt-image-1. " +
      "Supply `image` as a data URI, https URL, or local file path; optional `mask` for inpainting.",
    proxyPath: "/images/image2image",
    method: "POST",
    params: [
      {
        name: "prompt",
        type: "string",
        description: "Text prompt describing how to edit the image.",
        required: true,
      },
      {
        name: "image",
        type: "string",
        description: "Source image — data URI, https URL, or local path (~/... or /abs/path).",
        required: true,
      },
      {
        name: "mask",
        type: "string",
        description: "Optional inpainting mask in the same formats as `image`.",
        required: false,
      },
    ],
    pricing: {
      perUnit: "$0.02–$0.04",
      unit: "image",
      minimum: "$0.02",
      maximum: "$0.04 (1536x1024)",
    },
    example: {
      input: { prompt: "make the sky sunset orange", image: "~/Pictures/beach.png" },
      description: "Edit a local image with gpt-image-1",
    },
  },
  {
    id: "video_generation",
    name: "Video Generation",
    partner: "BlockRun",
    category: "Image & Video",
    shortDescription: "Grok Imagine + Seedance, 5–10s",
    description:
      "Generate a short video (5–10s) via xai/grok-imagine-video or bytedance/seedance-1.5-pro " +
      "(default, cheapest) / seedance-2.0-fast / seedance-2.0. Async — upstream polling takes " +
      "30–120 seconds. Returns a local http://localhost:8402/videos/<file>.mp4 URL.",
    proxyPath: "/videos/generations",
    method: "POST",
    params: [
      {
        name: "prompt",
        type: "string",
        description: "Text prompt describing the video.",
        required: true,
      },
      {
        name: "model",
        type: "string",
        description:
          "Full model ID. Options: bytedance/seedance-1.5-pro (default), bytedance/seedance-2.0-fast, " +
          "bytedance/seedance-2.0, xai/grok-imagine-video.",
        required: false,
      },
      {
        name: "duration_seconds",
        type: "number",
        description: "Clip length in seconds. Supported: 5, 8, 10. Default depends on model.",
        required: false,
      },
    ],
    pricing: {
      perUnit: "$0.03–$0.30",
      unit: "second",
      minimum: "$0.15 (seedance-1.5-pro 5s)",
      maximum: "$3.00 (seedance-2.0 10s)",
    },
    example: {
      input: { model: "bytedance/seedance-1.5-pro", prompt: "a cat waving", duration_seconds: 5 },
      description: "Generate a 5-second Seedance video",
    },
  },
];

/**
 * Get a partner service by ID.
 */
export function getPartnerService(id: string): PartnerServiceDefinition | undefined {
  return PARTNER_SERVICES.find((s) => s.id === id);
}
