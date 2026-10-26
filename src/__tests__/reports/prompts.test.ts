import { describe, expect, it } from "vitest";
import type { GitHubItem, GitHubRelease, RepoConfig } from "../../core/github.ts";
import { SECTIONS } from "../../core/strings.ts";
import {
  AGENTS_HIGHLIGHTS_FOCUS,
  HIGHLIGHTS_PICK_RULE,
  NO_MODEL_NEWS_NOTE,
  type ProjectActivity,
  announcementLinks,
  buildPageHighlightsPrompt,
  buildProjectDigestPrompt,
  buildSkillsPrompt,
  formatItem,
  hasActivity,
  isMajorRelease,
  releaseNotes,
  topN,
} from "../../reports/prompts.ts";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeItem(overrides: Partial<GitHubItem> = {}): GitHubItem {
  return {
    number: 1,
    title: "Test issue",
    state: "open",
    user: { login: "alice" },
    labels: [],
    created_at: "2026-03-09T00:00:00Z",
    updated_at: "2026-03-09T12:00:00Z",
    comments: 5,
    reactions: { "+1": 3 },
    body: "Some body text",
    html_url: "https://github.com/org/repo/issues/1",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const cfg: RepoConfig = { id: "test", repo: "org/test", name: "TestTool" };

const release: GitHubRelease = {
  tag_name: "v1.0.0",
  name: "Release 1.0",
  body: "Release notes",
  published_at: "2026-03-09T00:00:00Z",
  prerelease: false,
};

// ---------------------------------------------------------------------------
// buildProjectDigestPrompt
// ---------------------------------------------------------------------------

function makeActivity(overrides: Partial<ProjectActivity> = {}): ProjectActivity {
  return {
    config: cfg,
    releases: [],
    previews: [],
    prereleaseCount: 0,
    hotIssues: [],
    news: [],
    ...overrides,
  };
}

const scope = { subject: "AI coding agents", window: "last 24h", period: "today" };

// ---------------------------------------------------------------------------
// formatItem
// ---------------------------------------------------------------------------

describe("formatItem", () => {
  it("formats a basic item", () => {
    const result = formatItem(makeItem());
    expect(result).toContain("#1 [OPEN]");
    expect(result).toContain("Test issue");
    expect(result).toContain("Author: alice");
    expect(result).toContain("Comments: 5");
    expect(result).toContain("👍: 3");
    expect(result).toContain("URL: org/repo Issue #1");
    expect(result).toContain("Summary: Some body text");
  });

  it("includes labels when present", () => {
    const item = makeItem({ labels: [{ name: "bug" }, { name: "critical" }] });
    const result = formatItem(item);
    expect(result).toContain("[bug, critical]");
  });

  it("shows no label bracket when labels empty", () => {
    const result = formatItem(makeItem({ labels: [] }));
    expect(result).toContain("#1 [OPEN] Test issue");
    expect(result).not.toContain("[]");
  });

  it("truncates body at 300 chars with ellipsis", () => {
    const longBody = "A".repeat(400);
    const result = formatItem(makeItem({ body: longBody }));
    expect(result).toContain("A".repeat(300) + "...");
  });

  it("does not add ellipsis for body <= 300 chars", () => {
    const result = formatItem(makeItem({ body: "Short body" }));
    expect(result).toContain("Short body");
    expect(result).not.toContain("...");
  });

  it("handles null body gracefully", () => {
    const result = formatItem(makeItem({ body: null }));
    expect(result).toContain("Summary: ");
  });

  it("handles missing reactions gracefully", () => {
    const result = formatItem(makeItem({ reactions: undefined }));
    expect(result).toContain("👍: 0");
  });

  it("replaces newlines in body with spaces", () => {
    const result = formatItem(makeItem({ body: "line1\nline2\nline3" }));
    expect(result).toContain("line1 line2 line3");
  });

  it("shows closed state uppercase", () => {
    const result = formatItem(makeItem({ state: "closed" }));
    expect(result).toContain("[CLOSED]");
  });
});

// ---------------------------------------------------------------------------
// topN
// ---------------------------------------------------------------------------

describe("topN", () => {
  it("returns top N items sorted by comment count desc", () => {
    const items = [
      makeItem({ number: 1, comments: 2 }),
      makeItem({ number: 2, comments: 10 }),
      makeItem({ number: 3, comments: 5 }),
      makeItem({ number: 4, comments: 8 }),
    ];
    const result = topN(items, 2);
    expect(result).toHaveLength(2);
    expect(result[0]!.number).toBe(2);
    expect(result[1]!.number).toBe(4);
  });

  it("returns all items if n >= items.length", () => {
    const items = [makeItem({ comments: 1 }), makeItem({ comments: 2 })];
    expect(topN(items, 5)).toHaveLength(2);
  });

  it("does not mutate the original array", () => {
    const items = [makeItem({ comments: 1 }), makeItem({ comments: 5 })];
    const original = [...items];
    topN(items, 1);
    expect(items[0]!.comments).toBe(original[0]!.comments);
    expect(items[1]!.comments).toBe(original[1]!.comments);
  });

  it("returns empty array for empty input", () => {
    expect(topN([], 3)).toEqual([]);
  });
});

describe("hasActivity", () => {
  it("is false for a project with nothing but prereleases", () => {
    expect(hasActivity(makeActivity({ prereleaseCount: 3 }))).toBe(false);
  });

  it("is true for a release, a previewed prerelease, a hot issue or a news item", () => {
    expect(hasActivity(makeActivity({ releases: [release] }))).toBe(true);
    expect(hasActivity(makeActivity({ previews: [{ ...release, prerelease: true }] }))).toBe(true);
    expect(hasActivity(makeActivity({ hotIssues: [makeItem()] }))).toBe(true);
    expect(
      hasActivity(makeActivity({ news: [{ source: "Hacker News", title: "t", url: "u", detail: "d" }] })),
    ).toBe(true);
  });
});

describe("buildProjectDigestPrompt", () => {
  it("includes releases with their tag URL, hot issues and news", () => {
    const prompt = buildProjectDigestPrompt(
      [
        makeActivity({
          releases: [release],
          hotIssues: [makeItem({ title: "Crash on start" })],
          news: [{ source: "Hacker News", title: "TestTool 1.0", url: "https://hn/1", detail: "9 points" }],
        }),
      ],
      scope,
      "2026-10-04",
    );
    expect(prompt).toContain("## TestTool (github.com/org/test)");
    expect(prompt).toContain("https://github.com/org/test/releases/tag/v1.0.0");
    expect(prompt).toContain("Release notes");
    expect(prompt).toContain("Crash on start");
    expect(prompt).toContain("[Hacker News] TestTool 1.0 — https://hn/1 (9 points)");
    expect(prompt).toContain("2026-10-04 (last 24h)");
    expect(prompt).toContain("AI coding agents");
  });

  it("sends no prerelease list for a project that has a stable release", () => {
    const prompt = buildProjectDigestPrompt(
      [makeActivity({ releases: [release], prereleaseCount: 4 })],
      scope,
      "d",
    );
    expect(prompt).not.toContain("### Prereleases");
  });

  it("lists the prereleases of a project without a stable release, with longer, cleaned notes", () => {
    const features = "New plugin manager and Claude Code mods compatibility layer. ".repeat(15);
    const preview: GitHubRelease = {
      tag_name: "dsh-v0.2.0-rc.1",
      name: "dsh-v0.2.0-rc.1",
      body: `[中文](#cn-v0.2.0-rc.1) | [English](#en-v0.2.0-rc.1)\n<h3 id="en-v0.2.0-rc.1">New features</h3>\n${features}`,
      published_at: "2026-09-28T00:00:00Z",
      prerelease: true,
    };
    const prompt = buildProjectDigestPrompt([makeActivity({ previews: [preview] })], scope, "d");
    expect(prompt).toContain("### Prereleases (no stable release yet)");
    expect(prompt).toContain("https://github.com/org/test/releases/tag/dsh-v0.2.0-rc.1");
    expect(prompt).toContain("New features New plugin manager");
    expect(prompt).not.toContain("<h3");
    expect(prompt).not.toContain("(#en-");
    expect(releaseNotes(preview.body, 1500).length).toBeGreaterThan(400);
    expect(prompt).toContain("skip routine alpha/rc bumps");
  });

  it("leaves fenced code blocks (install commands) out of the release notes", () => {
    const body =
      "### Installation\n```bash\nbrew install org/tap/tool\n```\n```bash\n" +
      "x".repeat(400) +
      "\n```\n## What's new\n- Slash commands run safely";
    const prompt = buildProjectDigestPrompt([makeActivity({ releases: [{ ...release, body }] })], scope, "d");
    expect(prompt).not.toContain("brew install");
    expect(prompt).toContain("Slash commands run safely");
    expect(releaseNotes("```sh\nnpm i tool\n```", 400)).toBe("");
    expect(releaseNotes("~~~\ngo install tool\n~~~\nFixes", 400)).toBe("Fixes");
  });

  // DuckDB v2.0.0's notes, trimmed (2026-10-21).
  const duckdbBody =
    'This release of DuckDB is named "Cyanoptera" after Spatula Cyanoptera.\r\n\r\n' +
    "Please also refer to the announcement blog post: https://duckdb.org/2026/10/21/announcing-duckdb-200.html\r\n\r\n" +
    "## What's Changed\r\n" +
    "* Make `Identifier` a class instead of using string everywhere by @Mytherin in https://github.com/duckdb/duckdb/pull/23161\r\n" +
    "* Move to tidy-check diff again by @Mytherin in https://github.com/duckdb/duckdb/pull/23196\r\n" +
    "* Allow `MERGE INTO` in triggers by @Dtenwolde in https://github.com/duckdb/duckdb/pull/23201\r\n\r\n" +
    "## New Contributors\r\n* @someone made their first contribution in https://github.com/duckdb/duckdb/pull/23000\r\n\r\n" +
    "**Full Changelog**: https://github.com/duckdb/duckdb/compare/v1.5.0...v2.0.0";

  it("compacts a generated changelog to its PR titles and their count", () => {
    const notes = releaseNotes(duckdbBody, 1000);
    expect(notes).toContain("What's Changed (3 merged PRs): Make `Identifier` a class");
    expect(notes).toContain("Allow `MERGE INTO` in triggers;");
    expect(notes).not.toMatch(/@Mytherin|pull\/23161|first contribution|Full Changelog/);
    expect(releaseNotes("## What's Changed\n- Hand-written note", 400)).toBe(
      "## What's Changed - Hand-written note",
    );
  });

  it("skips badges, images, code, chat and package links, and trims trailing punctuation", () => {
    const body =
      "[![PyPI](https://img.shields.io/pypi/v/x.svg)](https://pypi.org/project/x)\n" +
      "![shot](https://user-images.githubusercontent.com/1/2.png)\n" +
      "```\npip install x --index-url https://download.example.com/whl/release\n```\n" +
      "Join https://discord.gg/abc or read https://docs.example.com/start.\n" +
      "**https://example.com/blog/v2**, and https://example.com/news/x-2-0.";
    expect(announcementLinks(body)).toEqual([
      "https://example.com/blog/v2",
      "https://example.com/news/x-2-0",
    ]);
    expect(announcementLinks("Read <https://example.com/blog/v2> first.")).toEqual([
      "https://example.com/blog/v2",
    ]);
    expect(
      announcementLinks('<a href="https://example.com/news/v2"><img src="https://example.com/post.png"></a>'),
    ).toEqual(["https://example.com/news/v2"]);
  });

  it("counts a changelog without a What's Changed header, or with a curly apostrophe", () => {
    const entry =
      "* Fix a thing by @a in https://github.com/o/r/pull/1\n* Add b by @dependabot[bot] in https://github.com/o/r/pull/2";
    expect(releaseNotes(`Big release.\n${entry}`, 400)).toBe(
      "Big release. What's Changed (2 merged PRs): Fix a thing; Add b;",
    );
    expect(releaseNotes(`## What’s Changed\n${entry}`, 400)).toBe(
      "What's Changed (2 merged PRs): Fix a thing; Add b;",
    );
  });

  it("finds a major release's announcement and shows it in the prompt", () => {
    expect(isMajorRelease("v2.0.0")).toBe(true);
    expect(isMajorRelease("2.0.0")).toBe(true);
    expect(isMajorRelease("v2.0.1")).toBe(false);
    expect(isMajorRelease("v2.1.0")).toBe(false);
    expect(announcementLinks(duckdbBody)).toEqual([
      "https://duckdb.org/2026/10/21/announcing-duckdb-200.html",
    ]);
    expect(announcementLinks("See https://github.com/o/r/pull/1")).toEqual([]);
    const prompt = buildProjectDigestPrompt(
      [
        makeActivity({
          releases: [
            { ...release, tag_name: "v2.0.0", body: duckdbBody, announcement: "Our biggest release." },
          ],
        }),
      ],
      scope,
      "d",
    );
    expect(prompt).toContain("Announcement: Our biggest release.");
    expect(prompt).toContain("describe it from the announcement");
    expect(prompt).toContain(
      "Link each release you name as a plain Markdown link, [tag](url), never inside backticks",
    );
    // The example itself in backticks was copied, links and all, into every release and issue line.
    expect(prompt).not.toContain("`[");
  });

  it("forbids stating absences", () => {
    const prompt = buildProjectDigestPrompt([makeActivity({ releases: [release] })], scope, "d");
    expect(prompt).toContain("Never state what did not happen");
  });

  it("caps the releases shown and notes the total", () => {
    const releases = Array.from({ length: 14 }, (_, i) => ({ ...release, tag_name: `b${100 - i}` }));
    const prompt = buildProjectDigestPrompt([makeActivity({ releases })], scope, "d");
    expect(prompt).toContain("(14 stable releases; showing newest 10)");
    expect(prompt).toContain("b100");
    expect(prompt).not.toContain("b87");
  });

  it("asks for one section per project and no overview", () => {
    const prompt = buildProjectDigestPrompt([makeActivity({ releases: [release] })], scope, "d");
    expect(prompt).not.toContain("Overview");
    expect(prompt).toContain("Write no other sections");
    expect(prompt).toContain("## <Project name>");
    expect(prompt).toContain("today");
  });

  it("lets the model leave out a project whose items it skipped", () => {
    const prompt = buildProjectDigestPrompt([makeActivity({ releases: [release] })], scope, "d");
    expect(prompt).toContain("that has something left to report");
    expect(prompt).toContain("leave out its section entirely");
  });
});

describe("buildPageHighlightsPrompt", () => {
  const prompt = buildPageHighlightsPrompt(
    "AI Agents",
    "## Coding Agents\n\n### Codex\n- Released 1.0.",
    AGENTS_HIGHLIGHTS_FOCUS,
    "2026-10-22",
  );

  it("gives the page name, its rendered body and its focus line", () => {
    expect(prompt).toContain("You are the editor of AI Agents");
    expect(prompt).toContain("### Codex\n- Released 1.0.");
    expect(prompt).toContain("a release with breaking changes, a hot regression");
    expect(prompt).toContain("2026-10-22");
  });

  it("asks for Highlights only: 1–3 ranked bullets, no links, each item once, ~100 words", () => {
    expect(prompt).toContain(`Write only \`## ${SECTIONS.highlights}\`: 1–3 bullets, most consequential`);
    expect(prompt).toContain("do not restate every row");
    expect(prompt).toContain("Write no links");
    expect(prompt).toContain("at most one bullet");
    expect(prompt).toContain(HIGHLIGHTS_PICK_RULE);
    expect(prompt).toContain("About 100 words");
    expect(prompt).not.toContain(SECTIONS.signals);
    expect(prompt).not.toContain("Worth a Look");
    expect(prompt).not.toContain("Overview");
  });
});

// ---------------------------------------------------------------------------
// buildSkillsPrompt
// ---------------------------------------------------------------------------

describe("buildSkillsPrompt", () => {
  it("includes skills repository context", () => {
    const result = buildSkillsPrompt([makeItem()], [makeItem()], "2026-03-09");
    expect(result).toContain("anthropics/skills");
    expect(result).toContain("Claude Code Skills");
  });

  it("shows None when no data", () => {
    const result = buildSkillsPrompt([], [], "2026-03-09");
    expect(result).toContain("Claude Code ecosystem");
    expect(result).toContain("None");
  });
});

describe("buildPageHighlightsPrompt note", () => {
  it("a models page without lab or model news says so instead of padding with Spotted rows", () => {
    const p = buildPageHighlightsPrompt("AI Models", "## Spotted", "f", "2026-10-26", NO_MODEL_NEWS_NOTE);
    expect(p).toContain("No lab or model news today.");
    expect(p).toContain("at most 2 bullets");
  });
});
