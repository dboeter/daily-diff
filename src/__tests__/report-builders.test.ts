import { describe, it, expect } from "vitest";
import {
  buildCliReportContent,
  buildOpenclawReportContent,
  buildInfraReportContent,
  extractTldr,
} from "../report-builders.ts";
import type { RepoDigest } from "../prompts.ts";
import type { GitHubItem, GitHubRelease } from "../github.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeDigest(overrides: Partial<RepoDigest> = {}): RepoDigest {
  return {
    config: { id: "test-tool", repo: "org/test-tool", name: "TestTool" },
    issues: [],
    prs: [],
    releases: [],
    discussions: [],
    summary: "Test summary content",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// buildCliReportContent
// ---------------------------------------------------------------------------

describe("buildCliReportContent", () => {
  it("includes title, meta, and all sections", () => {
    const digests = [
      makeDigest({ config: { id: "claude-code", repo: "anthropics/claude-code", name: "Claude Code" } }),
      makeDigest({ config: { id: "codex", repo: "openai/codex", name: "OpenAI Codex" } }),
    ];
    const result = buildCliReportContent(
      digests,
      "Skills summary",
      "Comparison content",
      "2026-03-09 00:00",
      "2026-03-09",
      "\n---\nfooter",
      "anthropics/skills",
    );

    expect(result).toContain("# AI CLI Tools Community Digest 2026-03-09");
    expect(result).toContain("Tools covered: 2");
    expect(result).toContain("[Claude Code](https://github.com/anthropics/claude-code)");
    expect(result).toContain("[Claude Code Skills](https://github.com/anthropics/skills)");
    expect(result).toContain("Cross-Tool Comparison");
    expect(result).toContain("Comparison content");
    expect(result).toContain("Skills summary");
    expect(result).toContain("footer");
  });

  it("includes title and meta in English", () => {
    const digests = [makeDigest()];
    const result = buildCliReportContent(
      digests,
      "Skills",
      "Comparison",
      "2026-03-09 00:00",
      "2026-03-09",
      "",
      "anthropics/skills",
    );
    expect(result).toContain("# AI CLI Tools Community Digest 2026-03-09");
    expect(result).toContain("Cross-Tool Comparison");
  });

  it("nests skills section inside claude-code details only", () => {
    const digests = [
      makeDigest({ config: { id: "claude-code", repo: "anthropics/claude-code", name: "Claude Code" } }),
      makeDigest({ config: { id: "codex", repo: "openai/codex", name: "Codex" } }),
    ];
    const result = buildCliReportContent(
      digests,
      "SKILLS_CONTENT",
      "comparison",
      "",
      "",
      "",
      "anthropics/skills",
    );

    // Skills should appear inside claude-code details
    const claudeIdx = result.indexOf("Claude Code");
    const skillsIdx = result.indexOf("SKILLS_CONTENT");
    expect(skillsIdx).toBeGreaterThan(claudeIdx);
    // Skills should not appear after codex section
    expect(result.split("SKILLS_CONTENT")).toHaveLength(2); // appears exactly once
  });
});

// ---------------------------------------------------------------------------
// buildOpenclawReportContent
// ---------------------------------------------------------------------------

describe("buildOpenclawReportContent", () => {
  it("includes all sections", () => {
    const openclaw = { id: "openclaw", repo: "openclaw/openclaw", name: "OpenClaw" };
    const peers = [{ id: "peer1", repo: "org/peer1", name: "Peer1" }];
    const peerDigests = [makeDigest({ config: peers[0] })];
    const fetchedOpenclaw = {
      cfg: openclaw,
      issues: [{ number: 1 } as unknown as GitHubItem],
      prs: [] as GitHubItem[],
      releases: [] as GitHubRelease[],
      discussions: [],
    };

    const result = buildOpenclawReportContent(
      fetchedOpenclaw,
      peerDigests,
      "OpenClaw summary",
      "Peers comparison",
      "2026-03-09 00:00",
      "2026-03-09",
      "\nfooter",
      openclaw,
      peers,
    );

    expect(result).toContain("# OpenClaw Ecosystem Digest 2026-03-09");
    expect(result).toContain("Issues: 1");
    expect(result).toContain("Projects covered: 2");
    expect(result).toContain("[OpenClaw](https://github.com/openclaw/openclaw)");
    expect(result).toContain("[Peer1](https://github.com/org/peer1)");
    expect(result).toContain("OpenClaw Deep Dive");
    expect(result).toContain("Cross-Ecosystem Comparison");
    expect(result).toContain("Peer Project Reports");
    expect(result).toContain("footer");
  });

  it("renders in English", () => {
    const openclaw = { id: "openclaw", repo: "openclaw/openclaw", name: "OpenClaw" };
    const result = buildOpenclawReportContent(
      { cfg: openclaw, issues: [], prs: [], releases: [], discussions: [] },
      [],
      "summary",
      "comparison",
      "",
      "2026-03-09",
      "",
      openclaw,
      [],
    );
    expect(result).toContain("# OpenClaw Ecosystem Digest 2026-03-09");
    expect(result).toContain("OpenClaw Deep Dive");
    expect(result).toContain("Cross-Ecosystem Comparison");
  });
});

// ---------------------------------------------------------------------------
// buildInfraReportContent
// ---------------------------------------------------------------------------

describe("buildInfraReportContent", () => {
  it("includes title, meta, and all sections", () => {
    const digests = [
      makeDigest({
        config: { id: "vllm", repo: "vllm-project/vllm", name: "vLLM" },
        summary: "vLLM summary",
      }),
      makeDigest({
        config: { id: "ollama", repo: "ollama/ollama", name: "Ollama" },
        summary: "Ollama summary",
      }),
    ];
    const result = buildInfraReportContent(
      digests,
      "Comparison content",
      "2026-03-09 00:00",
      "2026-03-09",
      "\n---\nfooter",
    );

    expect(result).toContain("# AI Infrastructure Digest 2026-03-09");
    expect(result).toContain("Projects covered: 2");
    expect(result).toContain("[vLLM](https://github.com/vllm-project/vllm)");
    expect(result).toContain("[Ollama](https://github.com/ollama/ollama)");
    expect(result).toContain("Cross-Project Comparison");
    expect(result).toContain("Comparison content");
    expect(result).toContain("vLLM summary");
    expect(result).toContain("Per-Project Reports");
    expect(result).toContain("footer");
  });

  it("renders in English", () => {
    const result = buildInfraReportContent([makeDigest()], "comparison", "", "2026-03-09", "");
    expect(result).toContain("# AI Infrastructure Digest 2026-03-09");
    expect(result).toContain("Projects covered: 1");
    expect(result).toContain("Cross-Project Comparison");
    expect(result).toContain("Per-Project Reports");
  });
});

// ---------------------------------------------------------------------------
// Brief (GitHub issue) variant
// ---------------------------------------------------------------------------

describe("extractTldr", () => {
  it("takes the TL;DR bullets and stops at the next heading", () => {
    const summary = "## 1. TL;DR\n\n- one\n* two\n\n## 2. Releases\n\n- not this";
    expect(extractTldr(summary)).toBe("- one\n- two");
  });

  it("caps at 3 bullets and normalizes numbered items", () => {
    expect(extractTldr("**TL;DR**\n1. a\n2. b\n3. c\n4. d")).toBe("- a\n- b\n- c");
  });

  it("falls back to the first bullets when there is no TL;DR section", () => {
    expect(extractTldr("## Highlights\n- x\n- y")).toBe("- x\n- y");
  });

  it("returns a fixed notice unchanged", () => {
    expect(extractTldr("No activity in the last 24 hours.")).toBe("No activity in the last 24 hours.");
  });
});

describe("brief variant", () => {
  const summary = "## 1. TL;DR\n- headline\n\n## 2. Stability\n- long detail";

  it("infra: shows TL;DR bullets and a full-report link instead of per-project detail", () => {
    const result = buildInfraReportContent(
      [makeDigest({ summary })],
      "comparison",
      "",
      "2026-03-09",
      "",
      "https://example.com/ai-infra.md",
    );
    expect(result).toContain("comparison");
    expect(result).toContain("- headline");
    expect(result).toContain("(https://example.com/ai-infra.md)");
    expect(result).not.toContain("long detail");
    expect(result).not.toContain("<details>");
  });

  it("full variant is unchanged when no URL is given", () => {
    const result = buildInfraReportContent([makeDigest({ summary })], "comparison", "", "2026-03-09", "");
    expect(result).toContain("long detail");
  });
});
