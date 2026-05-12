/**
 * XClawRouter wallet resolution.
 *
 * Wallet identity is resolved in this order:
 *   1. OKX onchainos CLI (if installed AND user is logged in) — preferred.
 *      Private keys never enter this process; signing happens via
 *      `onchainos payment x402-pay`. See onchainos-adapter.ts.
 *   2. Saved wallet.key file (legacy BIP-39 path)
 *   3. BLOCKRUN_WALLET_KEY env var (legacy)
 *   4. Auto-generated BIP-39 wallet (legacy fallback when no OKX wallet)
 *
 * The legacy BIP-39 path remains so users without onchainos still work, but
 * fresh installs that have onchainos installed and signed in will use the
 * OKX wallet identity instead of generating a new local key.
 */

import { writeFile, mkdir } from "node:fs/promises";
import { readTextFile } from "./fs-read.js";
import { join } from "node:path";
import { homedir } from "node:os";
import { privateKeyToAccount } from "viem/accounts";

import type { ProviderAuthMethod, ProviderAuthContext, ProviderAuthResult } from "./types.js";
import {
  generateWalletMnemonic,
  isValidMnemonic,
  deriveSolanaKeyBytes,
  deriveAllKeys,
  getSolanaAddress,
} from "./wallet.js";
import { OnchainOsAdapter } from "./onchainos-adapter.js";

// ---------------------------------------------------------------------------
// OKX onchainos detection
// ---------------------------------------------------------------------------

/**
 * Result of attempting to use the OKX onchainos Agentic Wallet.
 *
 * Every non-`ok` variant must be distinguishable by the caller — otherwise
 * users who half-installed onchainos, forgot to log in, or hit a transient CLI
 * error get the same silent local-key fallback and never learn why their OKX
 * wallet wasn't picked up.
 *
 * - `ok` — onchainos is installed, logged in, and we have a usable EVM address.
 * - `no-binary` — onchainos CLI is not on PATH. Tip handled at the call site
 *   (companion onboarding-tip issue covers when/how to suggest installing).
 * - `not-logged-in` — binary is installed but `wallet status` reports
 *   `loggedIn: false`. User just needs to run `onchainos login`.
 * - `status-error` — `wallet status` exited non-zero, timed out, or returned
 *   malformed output. `reason` carries the underlying CLI error message.
 * - `no-evm-address` — status is logged in but neither `wallet status` nor the
 *   `wallet addresses` fallback yielded an EVM address (e.g. a Solana-only
 *   account).
 * - `addresses-error` — status was logged in without an `evmAddress`, but the
 *   `wallet addresses` fallback itself failed. `reason` carries the CLI error.
 */
export type OnchainOsDetectionResult =
  | { kind: "ok"; address: `0x${string}`; email?: string; adapter: OnchainOsAdapter }
  | { kind: "no-binary" }
  | { kind: "not-logged-in" }
  | { kind: "status-error"; reason: string }
  | { kind: "no-evm-address" }
  | { kind: "addresses-error"; reason: string };

function errorReason(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

/**
 * Detect an OKX onchainos wallet, returning a discriminated result so callers
 * can surface a tailored warning per failure mode instead of silently falling
 * back to a local key.
 *
 * Some onchainos builds omit `evmAddress` from `wallet status`; when the user
 * is logged in but status has no address, fall back to `wallet addresses` to
 * recover the Base/EVM address. Without this fallback, the router would
 * incorrectly think there is no agentic wallet and silently generate a fresh
 * local key — sending users to a different address than their OKX wallet.
 */
export async function detectOnchainosWallet(): Promise<OnchainOsDetectionResult> {
  const adapter = new OnchainOsAdapter();
  if (!adapter.isInstalled()) return { kind: "no-binary" };

  let status;
  try {
    status = await adapter.status();
  } catch (err) {
    return { kind: "status-error", reason: errorReason(err) };
  }

  if (!status.loggedIn) return { kind: "not-logged-in" };

  let evmAddress = status.evmAddress;
  if (!evmAddress) {
    try {
      const addresses = await adapter.addresses();
      if (addresses.evm) evmAddress = addresses.evm;
    } catch (err) {
      return { kind: "addresses-error", reason: errorReason(err) };
    }
  }

  if (!evmAddress) return { kind: "no-evm-address" };
  return { kind: "ok", address: evmAddress, email: status.email, adapter };
}

/** URL where users can download / read about OKX onchainos. */
export const ONCHAINOS_DOWNLOAD_URL = "https://web3.okx.com/onchainos";

/**
 * Severity for each line in the Agentic Wallet status block. Lets callers
 * route the block through a structured logger (e.g. OpenClaw's
 * `api.logger.info` / `.warn`) without losing the install-state-vs.-failure
 * distinction, while plain stdout callers can just print all lines.
 *
 * - `info` — neutral confirmation (e.g. "✓ installed", "→ Run: …").
 * - `warn` — failure or missing-state marker (e.g. "⚠ not installed",
 *   "✗ not logged in"). Anything the user needs to *act on*.
 */
export type AgenticWalletStatusLine = { level: "info" | "warn"; text: string };

/**
 * Render the multi-line "Agentic Wallet status" block — the canonical
 * answer to "is OKX onchainos installed, am I logged in, and what should I
 * do about it?". Emitted on every non-OKX launch so users never wonder why
 * we silently fell back to a local key.
 *
 * Pure function returning structured lines (no `[XClawRouter]` prefix, no
 * console calls) so it can be routed to:
 * - plain stdout (`src/cli.ts`, via `console.log` after adding the
 *   `[XClawRouter] ` prefix), or
 * - OpenClaw's structured logger (`src/index.ts`, via `api.logger.info` /
 *   `api.logger.warn` — the plugin name prefix comes from the logger).
 *
 * Returns `[]` for `kind: "ok"` — the existing `Using OKX onchainos wallet:`
 * line already conveys "Agentic Wallet ready" and a status banner above it
 * would be noise.
 */
export function formatAgenticWalletStatus(
  detection: OnchainOsDetectionResult,
): AgenticWalletStatusLine[] {
  switch (detection.kind) {
    case "ok":
      // Status is implicit in the `Using OKX onchainos wallet: …` log that
      // follows. Don't emit a banner on the happy path.
      return [];
    case "no-binary":
      return [
        { level: "warn", text: "⚠ OKX Agentic Wallet not installed" },
        { level: "info", text: `  → Download: ${ONCHAINOS_DOWNLOAD_URL}` },
        { level: "info", text: "  → After install, run: onchainos login" },
      ];
    case "not-logged-in":
      return [
        { level: "info", text: "✓ OKX Agentic Wallet installed" },
        { level: "warn", text: "✗ Login status: not logged in" },
        { level: "info", text: "  → Run: onchainos login" },
      ];
    case "status-error":
      return [
        { level: "info", text: "✓ OKX Agentic Wallet installed" },
        {
          level: "warn",
          text: `✗ Login status: unknown — status check failed: ${detection.reason}`,
        },
      ];
    case "no-evm-address":
      return [
        { level: "info", text: "✓ OKX Agentic Wallet installed (logged in)" },
        { level: "warn", text: "✗ No EVM address found (Solana-only account?)" },
      ];
    case "addresses-error":
      return [
        { level: "info", text: "✓ OKX Agentic Wallet installed (logged in)" },
        { level: "warn", text: `✗ Could not read wallet addresses: ${detection.reason}` },
      ];
  }
}

// ---------------------------------------------------------------------------
// Payment chain persistence (used by both paths)
// ---------------------------------------------------------------------------

const WALLET_DIR = join(homedir(), ".openclaw", "blockrun");
const WALLET_FILE = join(WALLET_DIR, "wallet.key");
const MNEMONIC_FILE = join(WALLET_DIR, "mnemonic");
const CHAIN_FILE = join(WALLET_DIR, "payment-chain");

export { WALLET_DIR, WALLET_FILE, MNEMONIC_FILE, CHAIN_FILE };

export async function savePaymentChain(chain: "base" | "solana"): Promise<void> {
  await mkdir(WALLET_DIR, { recursive: true });
  await writeFile(CHAIN_FILE, chain + "\n", { mode: 0o600 });
}

export async function loadPaymentChain(): Promise<"base" | "solana"> {
  try {
    const content = (await readTextFile(CHAIN_FILE)).trim();
    if (content === "solana") return "solana";
    return "base";
  } catch {
    return "base";
  }
}

/**
 * Resolve payment chain: env var → persisted file → default "base".
 * Accepts both XCLAWROUTER_PAYMENT_CHAIN (preferred) and CLAWROUTER_PAYMENT_CHAIN
 * (legacy, deprecated — will be removed after one release).
 */
export async function resolvePaymentChain(): Promise<"base" | "solana"> {
  const env = process.env.XCLAWROUTER_PAYMENT_CHAIN ?? process.env.CLAWROUTER_PAYMENT_CHAIN;
  if (env === "solana") return "solana";
  if (env === "base") return "base";
  return loadPaymentChain();
}

// ---------------------------------------------------------------------------
// Local-key path (used when onchainos is unavailable)
// ---------------------------------------------------------------------------

async function loadSavedWallet(): Promise<string | undefined> {
  try {
    const key = (await readTextFile(WALLET_FILE)).trim();
    if (key.startsWith("0x") && key.length === 66) {
      console.log(`[XClawRouter] ✓ Loaded existing wallet from ${WALLET_FILE}`);
      return key;
    }
    console.error(`[XClawRouter] ✗ CRITICAL: Wallet file exists but has invalid format!`);
    console.error(`[XClawRouter]   File: ${WALLET_FILE}`);
    console.error(`[XClawRouter]   Expected: 0x followed by 64 hex characters (66 chars total)`);
    throw new Error(
      `Wallet file at ${WALLET_FILE} is corrupted or has wrong format. ` +
        `Refusing to auto-generate new wallet to protect existing funds. ` +
        `Restore your backup key or set BLOCKRUN_WALLET_KEY environment variable.`,
    );
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      if (err instanceof Error && err.message.includes("Refusing to auto-generate")) {
        throw err;
      }
      throw new Error(
        `Cannot read wallet file at ${WALLET_FILE}: ${err instanceof Error ? err.message : String(err)}.`,
        { cause: err },
      );
    }
  }
  return undefined;
}

async function loadMnemonic(): Promise<string | undefined> {
  try {
    const mnemonic = (await readTextFile(MNEMONIC_FILE)).trim();
    if (mnemonic && isValidMnemonic(mnemonic)) return mnemonic;
    console.warn(`[XClawRouter] ⚠ Mnemonic file exists but has invalid format — ignoring`);
    return undefined;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn(`[XClawRouter] ⚠ Cannot read mnemonic file — ignoring`);
    }
  }
  return undefined;
}

async function saveMnemonic(mnemonic: string): Promise<void> {
  await mkdir(WALLET_DIR, { recursive: true });
  await writeFile(MNEMONIC_FILE, mnemonic + "\n", { mode: 0o600 });
}

async function generateAndSaveWallet(): Promise<{
  key: string;
  address: string;
  mnemonic: string;
  solanaPrivateKeyBytes: Uint8Array;
}> {
  const existingMnemonic = await loadMnemonic();
  if (existingMnemonic) {
    throw new Error(
      `Mnemonic file exists at ${MNEMONIC_FILE} but wallet.key is missing.\n` +
        `Refusing to generate a new wallet to protect existing funds.`,
    );
  }

  const mnemonic = generateWalletMnemonic();
  const derived = deriveAllKeys(mnemonic);

  await mkdir(WALLET_DIR, { recursive: true });
  await writeFile(WALLET_FILE, derived.evmPrivateKey + "\n", { mode: 0o600 });
  await writeFile(MNEMONIC_FILE, mnemonic + "\n", { mode: 0o600 });

  const verification = (await readTextFile(WALLET_FILE)).trim();
  if (verification !== derived.evmPrivateKey) {
    throw new Error("Wallet file verification failed - content mismatch");
  }

  return {
    key: derived.evmPrivateKey,
    address: derived.evmAddress,
    mnemonic,
    solanaPrivateKeyBytes: derived.solanaPrivateKeyBytes,
  };
}

/**
 * Result of wallet resolution.
 *
 * - `source: "okx"` — OKX onchainos wallet is connected. `key` is undefined
 *   because signing is delegated to onchainos (no private key in this process).
 *   `onchainos` is the adapter the proxy uses to sign x402 payments.
 * - `source: "saved" | "env" | "config" | "generated"` — local key path.
 */
export type WalletResolution = {
  key?: string;
  address: string;
  source: "saved" | "env" | "config" | "generated" | "okx";
  mnemonic?: string;
  solanaPrivateKeyBytes?: Uint8Array;
  onchainos?: OnchainOsAdapter;
  email?: string;
  /**
   * The outcome of OKX onchainos detection. Present whenever
   * `resolveOrGenerateWalletKey` ran the detection — callers use this to
   * decide which warning, if any, to show the user. `kind: "ok"` accompanies
   * `source: "okx"`; any other kind means we fell back to a local key.
   */
  onchainosDetection?: OnchainOsDetectionResult;
};

/**
 * Resolve the wallet identity, preferring OKX onchainos when available.
 *
 * If onchainos is installed and logged in, returns its EVM address as the
 * wallet identity (no local key). Otherwise falls back to the legacy
 * local-key flow: saved file → env var → auto-generate.
 */
export async function resolveOrGenerateWalletKey(): Promise<WalletResolution> {
  // 1. Prefer OKX onchainos when installed + logged in.
  const onchainosDetection = await detectOnchainosWallet();
  if (onchainosDetection.kind === "ok") {
    return {
      address: onchainosDetection.address,
      source: "okx",
      onchainos: onchainosDetection.adapter,
      email: onchainosDetection.email,
      onchainosDetection,
    };
  }

  // 2. Legacy local-key path.
  const saved = await loadSavedWallet();
  if (saved) {
    const account = privateKeyToAccount(saved as `0x${string}`);
    const mnemonic = await loadMnemonic();
    if (mnemonic) {
      const solanaKeyBytes = deriveSolanaKeyBytes(mnemonic);
      return {
        key: saved,
        address: account.address,
        source: "saved",
        mnemonic,
        solanaPrivateKeyBytes: solanaKeyBytes,
        onchainosDetection,
      };
    }
    return { key: saved, address: account.address, source: "saved", onchainosDetection };
  }

  const envKey = process.env.BLOCKRUN_WALLET_KEY;
  if (typeof envKey === "string" && envKey.startsWith("0x") && envKey.length === 66) {
    const account = privateKeyToAccount(envKey as `0x${string}`);
    const mnemonic = await loadMnemonic();
    if (mnemonic) {
      const solanaKeyBytes = deriveSolanaKeyBytes(mnemonic);
      return {
        key: envKey,
        address: account.address,
        source: "env",
        mnemonic,
        solanaPrivateKeyBytes: solanaKeyBytes,
        onchainosDetection,
      };
    }
    return { key: envKey, address: account.address, source: "env", onchainosDetection };
  }

  const result = await generateAndSaveWallet();
  return {
    key: result.key,
    address: result.address,
    source: "generated",
    mnemonic: result.mnemonic,
    solanaPrivateKeyBytes: result.solanaPrivateKeyBytes,
    onchainosDetection,
  };
}

/** Restore wallet.key from an existing mnemonic file. */
export async function recoverWalletFromMnemonic(): Promise<void> {
  const mnemonic = await loadMnemonic();
  if (!mnemonic) {
    console.error(`[XClawRouter] No mnemonic found at ${MNEMONIC_FILE}`);
    process.exit(1);
  }

  const existing = await loadSavedWallet().catch(() => undefined);
  if (existing) {
    console.error(`[XClawRouter] wallet.key already exists at ${WALLET_FILE}`);
    process.exit(1);
  }

  const derived = deriveAllKeys(mnemonic);
  const solanaKeyBytes = deriveSolanaKeyBytes(mnemonic);
  const solanaAddress = await getSolanaAddress(solanaKeyBytes).catch(() => undefined);

  console.log(`[XClawRouter] Derived EVM Address   : ${derived.evmAddress}`);
  if (solanaAddress) console.log(`[XClawRouter] Derived Solana Address: ${solanaAddress}`);

  await mkdir(WALLET_DIR, { recursive: true });
  await writeFile(WALLET_FILE, derived.evmPrivateKey + "\n", { mode: 0o600 });
  console.log(`[XClawRouter] ✓ wallet.key restored at ${WALLET_FILE}`);
}

/** Set up Solana for an existing local-key wallet. Not used in OKX mode. */
export async function setupSolana(): Promise<{
  mnemonic: string;
  solanaPrivateKeyBytes: Uint8Array;
}> {
  const existing = await loadMnemonic();
  if (existing) throw new Error("Solana wallet already set up at " + MNEMONIC_FILE);

  const savedKey = await loadSavedWallet();
  if (!savedKey) {
    throw new Error(
      "No EVM wallet found. Run XClawRouter first to generate a wallet before setting up Solana.",
    );
  }

  const mnemonic = generateWalletMnemonic();
  const solanaKeyBytes = deriveSolanaKeyBytes(mnemonic);
  await saveMnemonic(mnemonic);

  return { mnemonic, solanaPrivateKeyBytes: solanaKeyBytes };
}

/** @deprecated Legacy manual-entry auth. */
export const walletKeyAuth: ProviderAuthMethod = {
  id: "wallet-key",
  label: "Wallet Private Key",
  hint: "Enter your EVM wallet private key (0x...) for x402 payments",
  kind: "api_key",
  run: async (ctx: ProviderAuthContext): Promise<ProviderAuthResult> => {
    const key = await ctx.prompter.text({
      message: "Enter your wallet private key (0x...)",
      validate: (value: string) => {
        const trimmed = value.trim();
        if (!trimmed.startsWith("0x")) return "Key must start with 0x";
        if (trimmed.length !== 66) return "Key must be 66 characters";
        if (!/^0x[0-9a-fA-F]{64}$/.test(trimmed)) return "Key must be valid hex";
        return undefined;
      },
    });

    if (!key || typeof key !== "string") throw new Error("Wallet key is required");

    return {
      profiles: [{ profileId: "default", credential: { apiKey: key.trim() } }],
      notes: ["Wallet key stored securely in OpenClaw credentials."],
    };
  },
};

/** @deprecated Legacy env-var auth. */
export const envKeyAuth: ProviderAuthMethod = {
  id: "env-key",
  label: "Environment Variable",
  hint: "Use BLOCKRUN_WALLET_KEY environment variable",
  kind: "api_key",
  run: async (): Promise<ProviderAuthResult> => {
    const key = process.env.BLOCKRUN_WALLET_KEY;
    if (!key) throw new Error("BLOCKRUN_WALLET_KEY environment variable is not set.");
    return {
      profiles: [{ profileId: "default", credential: { apiKey: key.trim() } }],
      notes: ["Using wallet key from BLOCKRUN_WALLET_KEY environment variable."],
    };
  },
};
