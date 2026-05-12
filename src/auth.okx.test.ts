/**
 * Tests for OKX onchainos detection in auth.ts.
 *
 * Stub PATH lookup by setting XCLAWROUTER_ONCHAINOS_BIN to a fake CLI script.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { writeFile, mkdtemp, rm, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  detectOnchainosWallet,
  formatAgenticWalletStatus,
  ONCHAINOS_DOWNLOAD_URL,
} from "./auth.js";

let tmpDir: string;
const ORIG_BIN = process.env.XCLAWROUTER_ONCHAINOS_BIN;

async function writeFakeCli(name: string, script: string): Promise<string> {
  const path = join(tmpDir, name);
  await writeFile(path, `#!/usr/bin/env node\n${script}\n`, "utf8");
  await chmod(path, 0o755);
  return path;
}

beforeAll(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), "auth-okx-test-"));
});

afterAll(async () => {
  await rm(tmpDir, { recursive: true, force: true });
  if (ORIG_BIN === undefined) delete process.env.XCLAWROUTER_ONCHAINOS_BIN;
  else process.env.XCLAWROUTER_ONCHAINOS_BIN = ORIG_BIN;
});

beforeEach(() => {
  delete process.env.XCLAWROUTER_ONCHAINOS_BIN;
});

afterEach(() => {
  delete process.env.XCLAWROUTER_ONCHAINOS_BIN;
});

describe("detectOnchainosWallet", () => {
  it("returns kind:ok with OKX address when installed and logged in", async () => {
    const bin = await writeFakeCli(
      "okx-logged-in",
      `
      const args = process.argv.slice(2);
      if (args[0] === "--version") { process.stdout.write("1.0.0"); process.exit(0); }
      if (args[0] === "wallet" && args[1] === "status") {
        process.stdout.write(JSON.stringify({
          data: {
            loggedIn: true,
            email: "user@example.com",
            evmAddress: "0xCafe000000000000000000000000000000000001",
          }
        }));
        process.exit(0);
      }
      process.exit(2);
      `,
    );
    process.env.XCLAWROUTER_ONCHAINOS_BIN = bin;
    const detected = await detectOnchainosWallet();
    expect(detected.kind).toBe("ok");
    if (detected.kind !== "ok") throw new Error("unreachable");
    expect(detected.address).toBe("0xCafe000000000000000000000000000000000001");
    expect(detected.email).toBe("user@example.com");
    expect(detected.adapter).toBeDefined();
  });

  it("returns kind:not-logged-in when binary is installed but status reports loggedIn:false", async () => {
    const bin = await writeFakeCli(
      "okx-logged-out",
      `
      const args = process.argv.slice(2);
      if (args[0] === "--version") { process.stdout.write("1.0.0"); process.exit(0); }
      if (args[0] === "wallet" && args[1] === "status") {
        process.stdout.write(JSON.stringify({ data: { loggedIn: false } }));
        process.exit(0);
      }
      process.exit(2);
      `,
    );
    process.env.XCLAWROUTER_ONCHAINOS_BIN = bin;
    const detected = await detectOnchainosWallet();
    expect(detected.kind).toBe("not-logged-in");
  });

  it("returns kind:no-binary when the binary is missing", async () => {
    process.env.XCLAWROUTER_ONCHAINOS_BIN = join(tmpDir, "definitely-missing");
    const detected = await detectOnchainosWallet();
    expect(detected.kind).toBe("no-binary");
  });

  it("falls back to `wallet addresses` when status omits evmAddress (kind:ok)", async () => {
    const bin = await writeFakeCli(
      "okx-status-no-evm",
      `
      const args = process.argv.slice(2);
      if (args[0] === "--version") { process.stdout.write("1.0.0"); process.exit(0); }
      if (args[0] === "wallet" && args[1] === "status") {
        // Logged in but no evmAddress field — the bug we are fixing.
        process.stdout.write(JSON.stringify({
          data: { loggedIn: true, email: "majesty@example.com" }
        }));
        process.exit(0);
      }
      if (args[0] === "wallet" && args[1] === "addresses") {
        process.stdout.write(JSON.stringify({
          data: {
            evm: [{ chain: "base", address: "0xFa11BackAddre550000000000000000000000001" }],
            solana: ["sOLfA11Back555555555555555555555555555555"],
          }
        }));
        process.exit(0);
      }
      process.exit(2);
      `,
    );
    process.env.XCLAWROUTER_ONCHAINOS_BIN = bin;
    const detected = await detectOnchainosWallet();
    expect(detected.kind).toBe("ok");
    if (detected.kind !== "ok") throw new Error("unreachable");
    expect(detected.address).toBe("0xFa11BackAddre550000000000000000000000001");
    expect(detected.email).toBe("majesty@example.com");
  });

  it("returns kind:no-evm-address when status AND addresses both lack an EVM address", async () => {
    const bin = await writeFakeCli(
      "okx-no-evm-anywhere",
      `
      const args = process.argv.slice(2);
      if (args[0] === "--version") { process.stdout.write("1.0.0"); process.exit(0); }
      if (args[0] === "wallet" && args[1] === "status") {
        process.stdout.write(JSON.stringify({ data: { loggedIn: true } }));
        process.exit(0);
      }
      if (args[0] === "wallet" && args[1] === "addresses") {
        // Solana-only wallet — no EVM/Base address available.
        process.stdout.write(JSON.stringify({
          data: { solana: ["sOLOnLy66666666666666666666666666666666666"] }
        }));
        process.exit(0);
      }
      process.exit(2);
      `,
    );
    process.env.XCLAWROUTER_ONCHAINOS_BIN = bin;
    const detected = await detectOnchainosWallet();
    expect(detected.kind).toBe("no-evm-address");
  });

  it("returns kind:addresses-error when status lacks evmAddress AND addresses CLI fails", async () => {
    const bin = await writeFakeCli(
      "okx-addresses-broken",
      `
      const args = process.argv.slice(2);
      if (args[0] === "--version") { process.stdout.write("1.0.0"); process.exit(0); }
      if (args[0] === "wallet" && args[1] === "status") {
        process.stdout.write(JSON.stringify({ data: { loggedIn: true } }));
        process.exit(0);
      }
      // wallet addresses crashes
      process.stderr.write("addresses subcommand crashed");
      process.exit(9);
      `,
    );
    process.env.XCLAWROUTER_ONCHAINOS_BIN = bin;
    const detected = await detectOnchainosWallet();
    expect(detected.kind).toBe("addresses-error");
    if (detected.kind !== "addresses-error") throw new Error("unreachable");
    expect(detected.reason.length).toBeGreaterThan(0);
  });

  it("returns kind:status-error when wallet status throws", async () => {
    const bin = await writeFakeCli(
      "okx-status-broken",
      `
      const args = process.argv.slice(2);
      if (args[0] === "--version") { process.stdout.write("1.0.0"); process.exit(0); }
      // Status exits non-zero — simulate broken wallet daemon.
      process.stderr.write("daemon down");
      process.exit(7);
      `,
    );
    process.env.XCLAWROUTER_ONCHAINOS_BIN = bin;
    const detected = await detectOnchainosWallet();
    expect(detected.kind).toBe("status-error");
    if (detected.kind !== "status-error") throw new Error("unreachable");
    expect(detected.reason.length).toBeGreaterThan(0);
  });
});

describe("formatAgenticWalletStatus", () => {
  it("returns no lines for kind:ok (status is implicit in the OKX wallet log)", () => {
    expect(
      formatAgenticWalletStatus({
        kind: "ok",
        address: "0xabc0000000000000000000000000000000000001",
        adapter: {} as never,
      }),
    ).toEqual([]);
  });

  it("walks the user through download + next step when onchainos is missing", () => {
    const lines = formatAgenticWalletStatus({ kind: "no-binary" });
    // Block leads with a clear "not installed" marker (warn level so it
    // routes to logger.warn in OpenClaw), then gives the literal download
    // URL and the post-install next command as info-level — the user can
    // act without leaving the terminal.
    expect(lines.length).toBeGreaterThanOrEqual(3);
    expect(lines[0].level).toBe("warn");
    expect(lines[0].text).toMatch(/⚠.*not installed/);
    expect(lines.some((l) => l.text.includes(ONCHAINOS_DOWNLOAD_URL))).toBe(true);
    expect(lines.some((l) => l.text.includes("Download:"))).toBe(true);
    expect(lines.some((l) => l.text.includes("onchainos login"))).toBe(true);
    // Download URL and next-command instructions are advisory, not failure
    // markers — they belong on info, not warn.
    expect(lines.find((l) => l.text.includes("Download:"))?.level).toBe("info");
    expect(lines.find((l) => l.text.includes("After install"))?.level).toBe("info");
  });

  it("confirms install AND shows logged-out status with literal next command", () => {
    const lines = formatAgenticWalletStatus({ kind: "not-logged-in" });
    const installed = lines.find((l) => /✓.*installed/.test(l.text));
    const loggedOut = lines.find((l) => /✗.*not logged in/.test(l.text));
    const action = lines.find((l) => l.text.includes("onchainos login"));
    expect(installed?.level).toBe("info");
    expect(loggedOut?.level).toBe("warn");
    expect(action?.level).toBe("info");
  });

  it("confirms install and surfaces the underlying reason for kind:status-error", () => {
    const lines = formatAgenticWalletStatus({ kind: "status-error", reason: "daemon down" });
    expect(lines.find((l) => /✓.*installed/.test(l.text))?.level).toBe("info");
    const failure = lines.find((l) => /status check failed/i.test(l.text));
    expect(failure?.level).toBe("warn");
    expect(failure?.text).toMatch(/daemon down/);
  });

  it("notes logged-in + missing EVM (Solana-only hint) for kind:no-evm-address", () => {
    const lines = formatAgenticWalletStatus({ kind: "no-evm-address" });
    expect(lines.find((l) => /✓.*installed.*logged in/.test(l.text))?.level).toBe("info");
    const failure = lines.find((l) => /No EVM address/i.test(l.text));
    expect(failure?.level).toBe("warn");
    expect(failure?.text).toMatch(/Solana-only/);
  });

  it("notes logged-in and the underlying reason for kind:addresses-error", () => {
    const lines = formatAgenticWalletStatus({
      kind: "addresses-error",
      reason: "addresses subcommand crashed",
    });
    expect(lines.find((l) => /✓.*installed.*logged in/.test(l.text))?.level).toBe("info");
    const failure = lines.find((l) => /Could not read wallet addresses/.test(l.text));
    expect(failure?.level).toBe("warn");
    expect(failure?.text).toMatch(/addresses subcommand crashed/);
  });

  it("emits only single-line entries (greppable, no embedded newlines, no prefix)", () => {
    const kinds = [
      { kind: "no-binary" as const },
      { kind: "not-logged-in" as const },
      { kind: "status-error" as const, reason: "err" },
      { kind: "no-evm-address" as const },
      { kind: "addresses-error" as const, reason: "err" },
    ];
    for (const detection of kinds) {
      const lines = formatAgenticWalletStatus(detection);
      expect(lines.length, `${detection.kind} should produce at least one line`).toBeGreaterThan(0);
      for (const line of lines) {
        // Each line is a single line, with an info|warn level marker, and
        // no [XClawRouter] prefix baked in (callers prefix as appropriate).
        expect(line.text.includes("\n"), `${detection.kind}: no newlines`).toBe(false);
        expect(["info", "warn"]).toContain(line.level);
        expect(line.text.startsWith("[XClawRouter]"), `${detection.kind}: no baked prefix`).toBe(
          false,
        );
      }
    }
  });
});
