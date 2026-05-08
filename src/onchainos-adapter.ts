/**
 * OnchainOsAdapter — thin wrapper around OKX's `onchainos` CLI.
 *
 * The CLI owns wallet state (email login, key material, on-chain interaction).
 * XClawRouter shells out to it for wallet identity and x402 payment signing
 * so private keys never live in this process.
 *
 * CLI surface used here (verified against okxclawrouter sample):
 *   onchainos --version
 *   onchainos wallet status                → { data: { loggedIn, evmAddress?, email? } }
 *   onchainos wallet addresses             → { data: { evm?, xlayer?, solana? } }
 *                                            Each chain may be a string, an array
 *                                            of strings, or an array of objects
 *                                            with an `address` field — handled
 *                                            tolerantly by `addresses()`.
 *   onchainos wallet login <email>         (interactive)
 *   onchainos wallet logout
 *   onchainos payment x402-pay --accepts <json>
 *                                          → { data: { signature, authorization, sessionCert? } }
 *
 * Some onchainos builds omit `evmAddress` from `wallet status` even when the
 * user is logged in. Callers should fall back to `addresses()` to recover the
 * Base/EVM address rather than treating "no evmAddress in status" as "no
 * onchainos wallet".
 *
 * Raw EIP-712 / typed-data signing is NOT exposed by onchainos, so we use
 * `payment x402-pay` for the entire signing step rather than the @x402/fetch
 * signer plumbing. See proxy.ts for the call site.
 */

import { execFile, execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DEFAULT_BIN = "onchainos";
const DEFAULT_TIMEOUT_MS = 30_000;
const PAYMENT_TIMEOUT_MS = 30_000;

const FALLBACK_CANDIDATES = [
  `${homedir()}/.local/bin/onchainos`,
  "/opt/homebrew/bin/onchainos",
  "/usr/local/bin/onchainos",
];

export interface OnchainOsStatus {
  loggedIn: boolean;
  email?: string;
  evmAddress?: `0x${string}`;
  solanaAddress?: string;
}

export interface OnchainOsAddresses {
  /** Base / EVM address. */
  evm?: `0x${string}`;
  /** OKX X Layer address (EVM-compatible). */
  xlayer?: `0x${string}`;
  /** Solana base58 address. */
  solana?: string;
}

export interface OnchainOsX402Payment {
  signature: string;
  authorization: Record<string, unknown>;
  sessionCert?: string;
}

export interface OnchainOsAdapterOptions {
  /** Override the CLI binary path. Defaults to env var, then PATH, then common installs. */
  bin?: string;
  /** Per-command timeout in ms. */
  timeoutMs?: number;
}

export class OnchainOsCliError extends Error {
  constructor(
    message: string,
    readonly stderr?: string,
    readonly exitCode?: number | null,
  ) {
    super(message);
    this.name = "OnchainOsCliError";
  }
}

/** Resolve the onchainos binary using env var → PATH → common install locations. */
export function resolveOnchainosBin(override?: string): string {
  if (override) return override;
  const env = process.env.XCLAWROUTER_ONCHAINOS_BIN ?? process.env.ONCHAINOS_BIN;
  if (env) return env;
  const fallback = FALLBACK_CANDIDATES.find((candidate) => existsSync(candidate));
  return fallback ?? DEFAULT_BIN;
}

async function runCli(bin: string, args: string[], opts: { timeoutMs: number }): Promise<string> {
  try {
    const { stdout } = await execFileAsync(bin, args, {
      timeout: opts.timeoutMs,
      maxBuffer: 8 * 1024 * 1024,
    });
    return stdout;
  } catch (err) {
    throw wrapCliError(err, bin, args);
  }
}

function wrapCliError(err: unknown, bin: string, args: string[]): OnchainOsCliError {
  const e = err as NodeJS.ErrnoException & {
    stderr?: string;
    code?: string | number | null;
  };
  if (e.code === "ENOENT") {
    return new OnchainOsCliError(
      `onchainos CLI not found at "${bin}". Install OKX's agentic wallet CLI ` +
        `(https://web3.okx.com/onchainos) and ensure it is on PATH, or set ` +
        `XCLAWROUTER_ONCHAINOS_BIN to the binary location.`,
    );
  }
  return new OnchainOsCliError(
    `onchainos ${args.join(" ")} failed: ${e.message}`,
    e.stderr,
    typeof e.code === "number" ? e.code : null,
  );
}

function parseJson<T>(stdout: string, label: string): T {
  const trimmed = stdout.trim();
  if (!trimmed) {
    throw new OnchainOsCliError(`onchainos ${label}: empty output`);
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch (err) {
    throw new OnchainOsCliError(
      `onchainos ${label}: invalid JSON output — ${(err as Error).message}\n${trimmed.slice(0, 500)}`,
    );
  }
}

/**
 * Many onchainos commands wrap their result in `{ data: ... }`. Some return the
 * payload directly. Accept both shapes so callers don't have to care.
 */
function unwrapData<T>(parsed: unknown): T {
  if (parsed && typeof parsed === "object" && "data" in parsed) {
    const inner = (parsed as { data?: unknown }).data;
    if (inner !== undefined && inner !== null) return inner as T;
  }
  return parsed as T;
}

/**
 * Pull a single address string out of whatever shape onchainos returned for a
 * given chain. The CLI is inconsistent across builds: it may emit a bare
 * string, an array of strings, or an array of objects with `address`/`value`
 * fields. We accept all three.
 */
function pickAddressString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = pickAddressString(item);
      if (found) return found;
    }
    return undefined;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of ["address", "evmAddress", "publicAddress", "value", "addr"]) {
      const candidate = obj[key];
      if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    }
  }
  return undefined;
}

function pickEvmAddress(value: unknown): `0x${string}` | undefined {
  const addr = pickAddressString(value);
  if (!addr || !addr.startsWith("0x") || addr.length !== 42) return undefined;
  return addr as `0x${string}`;
}

export class OnchainOsAdapter {
  private readonly bin: string;
  private readonly timeoutMs: number;

  constructor(opts: OnchainOsAdapterOptions = {}) {
    this.bin = resolveOnchainosBin(opts.bin);
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  /** Quick, synchronous probe — does the binary exist and respond to --version? */
  isInstalled(): boolean {
    try {
      execFileSync(this.bin, ["--version"], {
        encoding: "utf-8",
        stdio: "pipe",
        timeout: 5_000,
      });
      return true;
    } catch {
      return false;
    }
  }

  async status(): Promise<OnchainOsStatus> {
    const stdout = await runCli(this.bin, ["wallet", "status"], {
      timeoutMs: this.timeoutMs,
    });
    const raw = unwrapData<{
      loggedIn?: boolean;
      connected?: boolean;
      email?: string;
      evmAddress?: string;
      evm?: string;
      solanaAddress?: string;
      solana?: string;
    }>(parseJson(stdout, "wallet status"));

    const loggedIn = Boolean(raw.loggedIn ?? raw.connected);
    const evmAddress = (raw.evmAddress ?? raw.evm) as `0x${string}` | undefined;
    const solanaAddress = raw.solanaAddress ?? raw.solana;
    return {
      loggedIn,
      email: raw.email,
      evmAddress: evmAddress?.startsWith("0x") ? evmAddress : undefined,
      solanaAddress,
    };
  }

  /**
   * Fetch the wallet's addresses across chains. Use this as a fallback when
   * `wallet status` doesn't include `evmAddress` — some onchainos builds omit
   * the address from status but still expose it via `wallet addresses`.
   *
   * Tolerates the three shapes onchainos has shipped for each chain entry:
   *   - bare string: `"0xabc..."`
   *   - array of strings: `["0xabc...", "0xdef..."]`
   *   - array of objects: `[{ address: "0xabc...", chain: "base" }, ...]`
   */
  async addresses(): Promise<OnchainOsAddresses> {
    const stdout = await runCli(this.bin, ["wallet", "addresses"], {
      timeoutMs: this.timeoutMs,
    });
    const raw = unwrapData<{
      evm?: unknown;
      base?: unknown;
      xlayer?: unknown;
      solana?: unknown;
    }>(parseJson(stdout, "wallet addresses"));

    return {
      evm: pickEvmAddress(raw.evm ?? raw.base),
      xlayer: pickEvmAddress(raw.xlayer),
      solana: pickAddressString(raw.solana),
    };
  }

  async login(email: string): Promise<void> {
    if (!email.includes("@")) {
      throw new Error(`Invalid email address: ${email}`);
    }
    // Login involves an interactive verification step; allow more time.
    await runCli(this.bin, ["wallet", "login", email], { timeoutMs: 5 * 60_000 });
  }

  async logout(): Promise<void> {
    await runCli(this.bin, ["wallet", "logout"], { timeoutMs: this.timeoutMs });
  }

  /**
   * Sign an x402 payment via onchainos. Pass through the full `accepts` array
   * from the 402 response — onchainos picks the chain/scheme it can satisfy.
   */
  async signX402Payment(accepts: unknown[]): Promise<OnchainOsX402Payment> {
    const acceptsJson = JSON.stringify(accepts);
    const stdout = await runCli(this.bin, ["payment", "x402-pay", "--accepts", acceptsJson], {
      timeoutMs: PAYMENT_TIMEOUT_MS,
    });
    const parsed = parseJson<unknown>(stdout, "payment x402-pay");
    const result = unwrapData<Partial<OnchainOsX402Payment>>(parsed);
    if (!result.signature || typeof result.signature !== "string") {
      throw new OnchainOsCliError(
        `onchainos payment x402-pay returned no signature: ${JSON.stringify(parsed).slice(0, 500)}`,
      );
    }
    if (!result.authorization || typeof result.authorization !== "object") {
      throw new OnchainOsCliError(
        `onchainos payment x402-pay returned no authorization: ${JSON.stringify(parsed).slice(0, 500)}`,
      );
    }
    return {
      signature: result.signature,
      authorization: result.authorization as Record<string, unknown>,
      sessionCert: typeof result.sessionCert === "string" ? result.sessionCert : undefined,
    };
  }
}
