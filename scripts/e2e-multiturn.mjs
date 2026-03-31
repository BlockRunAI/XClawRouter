/**
 * E2E test: multi-turn chat with continue.dev scenario (issue #135)
 *
 * Simulates exactly what continue.dev does:
 *   Turn 1 (new chat)     → [system, user]
 *   Turn 2 (existing chat) → [system, user1, assistant1, user2]
 *
 * Before fix: Turn 2 always failed with "Unexpected error" from the SSE stream
 *             because kimi-k2.5 (primary MEDIUM model) returned 400 for missing
 *             reasoning_content on the plain text assistant message.
 * After fix:  Both turns succeed.
 */

const PROXY = "http://localhost:8402";
// Use free model so test doesn't need a funded wallet
const MODEL = "blockrun/eco";

function log(msg) {
  console.log(`\x1b[36m[e2e]\x1b[0m ${msg}`);
}
function ok(msg) {
  console.log(`\x1b[32m✓\x1b[0m ${msg}`);
}
function fail(msg) {
  console.error(`\x1b[31m✗\x1b[0m ${msg}`);
  process.exit(1);
}

/**
 * Consume an SSE streaming response and return the reconstructed assistant content.
 * Also detects error events so we can fail fast.
 */
async function collectSSE(response) {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HTTP ${response.status}: ${body.slice(0, 200)}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";
  let errorFound = null;
  let done = false;

  while (!done) {
    const { value, done: streamDone } = await reader.read();
    if (streamDone) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep partial line

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const raw = line.slice(6).trim();
      if (raw === "[DONE]") { done = true; break; }

      let chunk;
      try {
        chunk = JSON.parse(raw);
      } catch {
        continue; // SSE comments / heartbeats
      }

      // Detect error event
      if (chunk.error) {
        errorFound = chunk.error.message || JSON.stringify(chunk.error);
        done = true;
        break;
      }

      // Accumulate delta content
      const delta = chunk.choices?.[0]?.delta;
      if (delta?.content) content += delta.content;
    }
  }

  if (errorFound) throw new Error(`SSE error: ${errorFound}`);
  return content;
}

async function chatStream(messages) {
  return fetch(`${PROXY}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      messages,
    }),
  });
}

// ─── Turn 1: new chat ────────────────────────────────────────────────────────
log("Turn 1 — new chat: [system, user]");

const turn1Messages = [
  { role: "system", content: "You are a helpful assistant. Keep answers brief." },
  { role: "user", content: "Say exactly: hello" },
];

let assistantContent;
try {
  const resp1 = await chatStream(turn1Messages);
  assistantContent = await collectSSE(resp1);
  if (!assistantContent || assistantContent.trim().length === 0) {
    fail("Turn 1 returned empty content");
  }
  ok(`Turn 1 succeeded. Assistant said: "${assistantContent.trim().slice(0, 80)}"`);
} catch (err) {
  fail(`Turn 1 failed: ${err.message}`);
}

// ─── Turn 2: existing chat (the scenario that broke) ─────────────────────────
log("Turn 2 — existing chat: [system, user1, assistant1, user2]");

const turn2Messages = [
  ...turn1Messages,
  { role: "assistant", content: assistantContent }, // ← plain text, no reasoning_content
  { role: "user", content: "Now say exactly: world" },
];

let assistantContent2;
try {
  const resp2 = await chatStream(turn2Messages);
  assistantContent2 = await collectSSE(resp2);
  if (!assistantContent2 || assistantContent2.trim().length === 0) {
    fail("Turn 2 returned empty content");
  }
  ok(`Turn 2 succeeded. Assistant said: "${assistantContent2.trim().slice(0, 80)}"`);
} catch (err) {
  fail(`Turn 2 failed (issue #135 regression): ${err.message}`);
}

// ─── Turn 3: three-turn to be thorough ───────────────────────────────────────
log("Turn 3 — three-turn: [system, user1, assistant1, user2, assistant2, user3]");

const turn3Messages = [
  ...turn2Messages,
  { role: "assistant", content: assistantContent2 },
  { role: "user", content: "What did you say in your first reply?" },
];

try {
  const resp3 = await chatStream(turn3Messages);
  const assistantContent3 = await collectSSE(resp3);
  if (!assistantContent3 || assistantContent3.trim().length === 0) {
    fail("Turn 3 returned empty content");
  }
  ok(`Turn 3 succeeded. Assistant said: "${assistantContent3.trim().slice(0, 80)}"`);
} catch (err) {
  fail(`Turn 3 failed: ${err.message}`);
}

console.log("\n\x1b[32m✓ All 3 turns passed — multi-turn fix verified\x1b[0m");
