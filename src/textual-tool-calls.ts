/**
 * Extract tool calls that some models emit as XML/text inside `content`
 * instead of (or alongside an empty) structured `tool_calls` array.
 *
 * Two known shapes are recognized:
 *
 * 1. **OpenClaw-style** — `<tool_call>NAME<arg_key>K</arg_key><arg_value>V</arg_value>...</tool_call>`
 *    Observed in production: OpenClaw prompts certain models with this format
 *    and they honor it, but the calls land in `content` as plain text instead
 *    of in `message.tool_calls`. At least one `arg_key`/`arg_value` pair is
 *    required so a prose mention like `<tool_call>name</tool_call>` in
 *    documentation does not mis-fire.
 *
 * 2. **Anthropic-style** — `<function_calls><invoke name="NAME"><parameter name="K">V</parameter>...</invoke></function_calls>`
 *    Observed from Moonshot Kimi K2.6 in repro. The `<function_calls>` outer
 *    tag is unique enough that prose mis-fires are very rare, so zero
 *    parameters are still recognized inside this shape.
 *
 * Values are best-effort coerced via `JSON.parse` (so `"5"` → `5`, `"true"` →
 * `true`); strings that don't parse as JSON stay as strings.
 */
import { randomBytes } from "node:crypto";

export type ExtractedToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type ExtractionResult = {
  toolCalls: ExtractedToolCall[];
  cleanedContent: string;
};

// Require at least one arg_key/arg_value pair to avoid matching prose
// documentation that happens to mention `<tool_call>name</tool_call>`.
const OPENCLAW_TOOL_CALL_RE =
  /<tool_call>([^<]+?)((?:<arg_key>[\s\S]*?<\/arg_key>\s*<arg_value>[\s\S]*?<\/arg_value>\s*)+)<\/tool_call>/g;

const OPENCLAW_ARG_RE = /<arg_key>([\s\S]*?)<\/arg_key>\s*<arg_value>([\s\S]*?)<\/arg_value>/g;

const ANTHROPIC_BLOCK_RE = /<function_calls\b[^>]*>([\s\S]*?)<\/function_calls\s*>/g;
const ANTHROPIC_INVOKE_RE = /<invoke\s+name=["']([^"']+)["'][^>]*>([\s\S]*?)<\/invoke\s*>/g;
const ANTHROPIC_PARAM_RE = /<parameter\s+name=["']([^"']+)["'][^>]*>([\s\S]*?)<\/parameter\s*>/g;

function generateId(): string {
  // OpenAI-shaped: "call_" + base64url chars. Length comparable to real OpenAI ids.
  return `call_${randomBytes(12).toString("base64url")}`;
}

function coerceValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === "") return raw;
  try {
    return JSON.parse(trimmed);
  } catch {
    return raw;
  }
}

type Range = { start: number; end: number };

function extractOpenClawCalls(content: string): {
  calls: ExtractedToolCall[];
  matches: Range[];
} {
  const calls: ExtractedToolCall[] = [];
  const matches: Range[] = [];

  OPENCLAW_TOOL_CALL_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = OPENCLAW_TOOL_CALL_RE.exec(content)) !== null) {
    const name = match[1]?.trim();
    if (!name) continue;
    const argsBlock = match[2] ?? "";

    const args: Record<string, unknown> = {};
    OPENCLAW_ARG_RE.lastIndex = 0;
    let argMatch: RegExpExecArray | null;
    while ((argMatch = OPENCLAW_ARG_RE.exec(argsBlock)) !== null) {
      const key = argMatch[1]?.trim();
      const valueRaw = argMatch[2] ?? "";
      if (key) {
        args[key] = coerceValue(valueRaw);
      }
    }

    calls.push({
      id: generateId(),
      type: "function",
      function: { name, arguments: JSON.stringify(args) },
    });
    matches.push({ start: match.index, end: match.index + match[0].length });
  }

  return { calls, matches };
}

function extractAnthropicCalls(content: string): {
  calls: ExtractedToolCall[];
  matches: Range[];
} {
  const calls: ExtractedToolCall[] = [];
  const matches: Range[] = [];

  ANTHROPIC_BLOCK_RE.lastIndex = 0;
  let blockMatch: RegExpExecArray | null;
  while ((blockMatch = ANTHROPIC_BLOCK_RE.exec(content)) !== null) {
    const inner = blockMatch[1] ?? "";
    let invokeFound = false;

    ANTHROPIC_INVOKE_RE.lastIndex = 0;
    let invokeMatch: RegExpExecArray | null;
    while ((invokeMatch = ANTHROPIC_INVOKE_RE.exec(inner)) !== null) {
      const name = invokeMatch[1];
      if (!name) continue;
      const invokeInner = invokeMatch[2] ?? "";

      const args: Record<string, unknown> = {};
      ANTHROPIC_PARAM_RE.lastIndex = 0;
      let paramMatch: RegExpExecArray | null;
      while ((paramMatch = ANTHROPIC_PARAM_RE.exec(invokeInner)) !== null) {
        const key = paramMatch[1];
        const valueRaw = paramMatch[2] ?? "";
        if (key) {
          args[key] = coerceValue(valueRaw);
        }
      }

      calls.push({
        id: generateId(),
        type: "function",
        function: { name, arguments: JSON.stringify(args) },
      });
      invokeFound = true;
    }

    if (invokeFound) {
      matches.push({ start: blockMatch.index, end: blockMatch.index + blockMatch[0].length });
    }
  }

  return { calls, matches };
}

function stripRanges(content: string, ranges: Range[]): string {
  if (ranges.length === 0) return content;
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  let cleaned = "";
  let cursor = 0;
  for (const r of sorted) {
    if (r.start >= cursor) {
      cleaned += content.slice(cursor, r.start);
      cursor = r.end;
    }
  }
  cleaned += content.slice(cursor);
  return cleaned;
}

export function extractTextualToolCalls(content: string): ExtractionResult {
  if (!content) {
    return { toolCalls: [], cleanedContent: "" };
  }

  const openClaw = extractOpenClawCalls(content);
  const anthropic = extractAnthropicCalls(content);

  const toolCalls = [...openClaw.calls, ...anthropic.calls];
  if (toolCalls.length === 0) {
    return { toolCalls: [], cleanedContent: content };
  }

  const cleanedContent = stripRanges(content, [...openClaw.matches, ...anthropic.matches]);
  return { toolCalls, cleanedContent };
}
