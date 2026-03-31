/**
 * Tests for normalizeMessagesForThinking — regression for issue #135
 *
 * Continue.dev multi-turn chats with reasoning models (kimi-k2.5, deepseek-r1, etc.)
 * were failing because plain text assistant messages in history were missing
 * reasoning_content. The fix: add reasoning_content: "" to ALL assistant messages.
 */
import { describe, expect, it } from "vitest";

import { normalizeMessagesForThinking } from "./proxy.js";

describe("normalizeMessagesForThinking — issue #135 multi-turn fix", () => {
  it("adds reasoning_content to a plain text assistant message (the issue #135 case)", () => {
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Say hello" },
      { role: "assistant", content: "hello" }, // ← plain text, no tool_calls
      { role: "user", content: "Now say world" },
    ];

    const result = normalizeMessagesForThinking(messages as never);

    const assistantMsg = result.find((m) => m.role === "assistant") as Record<string, unknown>;
    expect(assistantMsg).toBeDefined();
    expect(assistantMsg.reasoning_content).toBe("");
    expect(assistantMsg.content).toBe("hello"); // content preserved
  });

  it("does not overwrite reasoning_content when already present", () => {
    const messages = [
      { role: "assistant", content: "hi", reasoning_content: "I thought about this" },
    ];

    const result = normalizeMessagesForThinking(messages as never);
    const msg = result[0] as Record<string, unknown>;
    expect(msg.reasoning_content).toBe("I thought about this"); // unchanged
  });

  it("adds reasoning_content to assistant messages with tool_calls (original behavior preserved)", () => {
    const messages = [
      {
        role: "assistant",
        content: null,
        tool_calls: [
          { id: "call_1", type: "function", function: { name: "read_file", arguments: "{}" } },
        ],
      },
    ];

    const result = normalizeMessagesForThinking(messages as never);
    const msg = result[0] as Record<string, unknown>;
    expect(msg.reasoning_content).toBe("");
  });

  it("does not modify non-assistant messages", () => {
    const messages = [
      { role: "system", content: "System prompt" },
      { role: "user", content: "User question" },
    ];

    const result = normalizeMessagesForThinking(messages as never);
    for (const msg of result) {
      expect((msg as Record<string, unknown>).reasoning_content).toBeUndefined();
    }
  });

  it("handles multi-turn: all assistant messages get reasoning_content", () => {
    const messages = [
      { role: "user", content: "q1" },
      { role: "assistant", content: "a1" },
      { role: "user", content: "q2" },
      { role: "assistant", content: "a2" },
      { role: "user", content: "q3" },
    ];

    const result = normalizeMessagesForThinking(messages as never);
    const assistants = result.filter((m) => m.role === "assistant");
    expect(assistants).toHaveLength(2);
    for (const msg of assistants) {
      expect((msg as Record<string, unknown>).reasoning_content).toBe("");
    }
  });

  it("returns same reference when no changes needed (all already have reasoning_content)", () => {
    const messages = [{ role: "assistant", content: "hi", reasoning_content: "" }];

    const result = normalizeMessagesForThinking(messages as never);
    expect(result).toBe(messages); // same reference — no unnecessary copy
  });

  it("returns same reference for empty array", () => {
    const messages: never[] = [];
    const result = normalizeMessagesForThinking(messages);
    expect(result).toBe(messages);
  });
});
