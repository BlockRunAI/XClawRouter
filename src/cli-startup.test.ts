import { describe, it, expect } from "vitest";
import { enableBlockingStdout, resolveAutoBaseChain, formatFundingHint } from "./cli-startup.js";

describe("enableBlockingStdout", () => {
  it("is a no-op on a TTY (never touches the handle)", () => {
    let called = false;
    const stream = {
      isTTY: true,
      _handle: {
        setBlocking() {
          called = true;
        },
      },
    };
    expect(enableBlockingStdout(stream)).toBe(false);
    expect(called).toBe(false);
  });

  it("switches the handle to blocking on a non-TTY stream", () => {
    const calls: boolean[] = [];
    const stream = {
      isTTY: false,
      _handle: {
        setBlocking(b: boolean) {
          calls.push(b);
        },
      },
    };
    expect(enableBlockingStdout(stream)).toBe(true);
    expect(calls).toEqual([true]);
  });

  it("returns false (no throw) when a non-TTY stream has no handle", () => {
    expect(enableBlockingStdout({ isTTY: false })).toBe(false);
  });

  it("swallows a throwing setBlocking and returns false", () => {
    const stream = {
      isTTY: false,
      _handle: {
        setBlocking() {
          throw new Error("setBlocking not supported here");
        },
      },
    };
    expect(enableBlockingStdout(stream)).toBe(false);
  });
});

describe("resolveAutoBaseChain", () => {
  it("switches an OKX wallet off Solana to Base", () => {
    expect(resolveAutoBaseChain({ walletSource: "okx", currentChain: "solana" })).toBe("base");
  });

  it("is a no-op when an OKX wallet is already on Base", () => {
    expect(resolveAutoBaseChain({ walletSource: "okx", currentChain: "base" })).toBeNull();
  });

  it("honours an explicit env pin even on OKX + Solana", () => {
    expect(
      resolveAutoBaseChain({ walletSource: "okx", currentChain: "solana", pinnedChain: "solana" }),
    ).toBeNull();
    expect(
      resolveAutoBaseChain({ walletSource: "okx", currentChain: "solana", pinnedChain: "base" }),
    ).toBeNull();
  });

  it("never switches a non-OKX wallet, regardless of chain", () => {
    expect(resolveAutoBaseChain({ walletSource: "saved", currentChain: "solana" })).toBeNull();
    expect(resolveAutoBaseChain({ walletSource: "generated", currentChain: "solana" })).toBeNull();
  });
});

describe("formatFundingHint", () => {
  it("returns the one-line hint for non-OKX wallets", () => {
    expect(formatFundingHint("saved", "0xABCDEF")).toEqual([
      "Fund wallet for premium models: 0xABCDEF",
    ]);
  });

  it("returns a 5-line framed block for OKX wallets containing the address", () => {
    const addr = "0xb4c0000000000000000000000000000000abad8b";
    const lines = formatFundingHint("okx", addr);
    expect(lines).toHaveLength(5);
    expect(lines[0].startsWith("┌")).toBe(true);
    expect(lines[4].startsWith("└")).toBe(true);
    expect(lines.some((l) => l.includes("Send USDC on Base"))).toBe(true);
    expect(lines.some((l) => l.includes(addr))).toBe(true);
  });

  it("draws a frame whose lines are all the same width (no overflow)", () => {
    const lines = formatFundingHint("okx", "0xdeadbeef");
    const widths = new Set(lines.map((l) => [...l].length));
    expect(widths.size).toBe(1);
  });

  it("grows the frame to fit an address longer than the heading", () => {
    const longAddr = "0x" + "a".repeat(80);
    const lines = formatFundingHint("okx", longAddr);
    const widths = new Set(lines.map((l) => [...l].length));
    expect(widths.size).toBe(1);
    // the address line still contains the full, untruncated address
    expect(lines.some((l) => l.includes(longAddr))).toBe(true);
  });
});
