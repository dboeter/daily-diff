import { describe, it, expect } from "vitest";
import { buildProjectReportContent, buildStealthSection } from "../report-builders.ts";
import type { ProjectActivity } from "../prompts.ts";
import type { GitHubRelease } from "../github.ts";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

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

  it("renders the preamble between the header and the LLM body", () => {
    const result = buildProjectReportContent({ ...input, preamble: "PREAMBLE\n\n---\n\n" });
    expect(result).toMatch(
      /Prereleases \(not covered\): 7\n\n---\n\nPREAMBLE\n\n---\n\n## Overview\nLLM_BODY/,
    );
  });
});

// ---------------------------------------------------------------------------
// buildStealthSection
// ---------------------------------------------------------------------------

describe("buildStealthSection", () => {
  const now = Date.parse("2026-10-04T22:37:00Z");
  const model = (created: string, expires: string | null) => ({
    id: "stealth/space-bunny-alpha",
    name: "Space Bunny Alpha",
    created,
    expires,
  });

  it("flags new and soon-expiring models", () => {
    const out = buildStealthSection([model("2026-10-03", "2026-10-05")], now);
    expect(out).toContain("## 🕵️ Stealth Models on OpenRouter");
    expect(out).toContain(
      "| [Space Bunny Alpha](https://openrouter.ai/stealth/space-bunny-alpha) `stealth/space-bunny-alpha` | 2026-10-03 | 2026-10-05 | 🆕 new, ⏳ expires in 1d |",
    );
  });

  it("marks an established model without a near expiry as live", () => {
    expect(buildStealthSection([model("2026-09-23", null)], now)).toContain("| 2026-09-23 | — | live |");
  });

  it("says so when no stealth model is listed or the catalog failed", () => {
    expect(buildStealthSection([], now)).toContain("No stealth models listed");
    expect(buildStealthSection(null, now)).toContain("catalog unavailable");
  });
});

// ---------------------------------------------------------------------------
// Brief (GitHub issue) variant
// ---------------------------------------------------------------------------
