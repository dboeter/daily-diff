import { describe, it, expect } from "vitest";
import { buildProjectReportContent } from "../report-builders.ts";
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
});

// ---------------------------------------------------------------------------
// Brief (GitHub issue) variant
// ---------------------------------------------------------------------------
