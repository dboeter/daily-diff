import { describe, it, expect } from "vitest";
import { buildProjectReportContent, buildInfraReportContent, extractTldr } from "../report-builders.ts";
import type { ProjectActivity, RepoDigest } from "../prompts.ts";
import type { GitHubRelease } from "../github.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeDigest(overrides: Partial<RepoDigest> = {}): RepoDigest {
  return {
    config: { id: "test-tool", repo: "org/test-tool", name: "TestTool" },
    issues: [],
    prs: [],
    releases: [],
    summary: "Test summary content",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// buildProjectReportContent
// ---------------------------------------------------------------------------

function makeActivity(id: string, overrides: Partial<ProjectActivity> = {}): ProjectActivity {
  return {
    config: { id, repo: `org/${id}`, name: id.toUpperCase() },
    releases: [],
    prereleaseCount: 0,
    hotIssues: [],
    news: [],
    ...overrides,
  };
}

const stableRelease: GitHubRelease = {
  tag_name: "v1",
  name: "v1",
  published_at: "2026-10-04T00:00:00Z",
  prerelease: false,
};

describe("buildProjectReportContent", () => {
  const input = {
    title: "AI Agents Digest",
    dateStr: "2026-10-04",
    utcStr: "2026-10-03 22:50",
    summary: "## Overview\nLLM_BODY",
    period: "today",
    footer: "FOOTER",
    activities: [
      makeActivity("alpha", { releases: [stableRelease], prereleaseCount: 2 }),
      makeActivity("beta", { prereleaseCount: 5 }),
      makeActivity("gamma"),
    ],
  };

  it("renders title, counts, the LLM body and the footer", () => {
    const result = buildProjectReportContent(input);
    expect(result).toContain("# AI Agents Digest 2026-10-04");
    expect(result).toContain(
      "Projects: 3 | Active today: 1 | Stable releases: 1 | Prereleases (not covered): 7",
    );
    expect(result).toContain("LLM_BODY");
    expect(result.endsWith("FOOTER")).toBe(true);
  });

  it("lists quiet projects in one line, prerelease-only ones included", () => {
    const result = buildProjectReportContent(input);
    expect(result).toContain(
      "**Quiet today:** [BETA](https://github.com/org/beta), [GAMMA](https://github.com/org/gamma)",
    );
    expect(result).not.toContain("[ALPHA]");
  });

  it("omits the quiet line when every project was active", () => {
    const result = buildProjectReportContent({ ...input, activities: [input.activities[0]!] });
    expect(result).not.toContain("Quiet today");
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
