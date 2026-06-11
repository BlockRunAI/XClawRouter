/**
 * Pure startup helpers for the CLI entry point (`cli.ts`).
 *
 * These are factored out of `main()` so they can be unit-tested without
 * executing the whole CLI (which resolves a wallet, starts the proxy, and
 * never returns). `cli.ts` imports them; the behaviour lives here.
 */

type PaymentChain = "base" | "solana";

/**
 * Force blocking stdout when it isn't a TTY.
 *
 * Node uses 4KB block buffering for stdout in non-TTY contexts (systemd,
 * Docker, PM2, pipes). Our Agentic Wallet status block and funding hints are
 * far smaller than 4KB, so under a process manager they'd never flush and the
 * user would see nothing. A TTY already line-buffers, so this is a no-op there.
 *
 * Best-effort: never throws. Returns `true` only if it actually switched a
 * handle to blocking mode.
 */
export function enableBlockingStdout(
  stream: {
    isTTY?: boolean;
    _handle?: { setBlocking(blocking: boolean): void };
  } = process.stdout,
): boolean {
  if (stream.isTTY) return false;
  try {
    if (!stream._handle) return false;
    stream._handle.setBlocking(true);
    return true;
  } catch {
    // Best-effort — never let a buffering tweak crash startup.
    return false;
  }
}

/**
 * Decide whether to auto-switch the persisted payment chain to Base.
 *
 * OKX Agentic Wallets are EVM-only (Base). A prior local-wallet setup may have
 * persisted the chain as Solana; signing via `onchainos payment pay` would then
 * target the wrong chain and fail. We auto-correct to Base for OKX wallets —
 * unless the user explicitly pinned a chain via env var, which we always honour.
 *
 * Returns `"base"` when a switch is needed, otherwise `null` (no-op).
 */
export function resolveAutoBaseChain(opts: {
  walletSource: string;
  currentChain: PaymentChain;
  pinnedChain?: string;
}): "base" | null {
  if (opts.walletSource !== "okx") return null;
  if (opts.pinnedChain) return null; // honour an explicit env pin
  return opts.currentChain === "base" ? null : "base";
}

/**
 * Format the empty-balance funding hint (without the `[XClawRouter] ` prefix —
 * the caller adds that per line).
 *
 * OKX wallets get a framed block telling them which chain/asset/address to use;
 * every other wallet source gets the original one-line hint. The box is sized to
 * the longest of its lines so a long EVM address never overflows the frame.
 */
export function formatFundingHint(walletSource: string, address: string): string[] {
  if (walletSource !== "okx") {
    return [`Fund wallet for premium models: ${address}`];
  }
  const heading = "Fund your OKX Agentic Wallet for premium models";
  const instruction = "Send USDC on Base to your EVM address:";
  const inner = Math.max(heading.length, instruction.length, address.length) + 2;
  const pad = (s: string) => ` ${s}${" ".repeat(inner - s.length - 1)}`;
  return [
    `┌${"─".repeat(inner)}┐`,
    `│${pad(heading)}│`,
    `│${pad(instruction)}│`,
    `│${pad(address)}│`,
    `└${"─".repeat(inner)}┘`,
  ];
}
