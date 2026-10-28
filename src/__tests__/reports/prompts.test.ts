import fs from "node:fs";
import { describe, expect, it } from "vitest";
import type { GitHubItem, GitHubRelease, RepoConfig } from "../../core/github.ts";
import { SECTIONS } from "../../core/strings.ts";
import {
  AGENTS_HIGHLIGHTS_FOCUS,
  HIGHLIGHTS_PICK_RULE,
  NO_MODEL_NEWS_NOTE,
  type ProjectActivity,
  RELEASE_BODY_CHARS,
  announcementLinks,
  buildPageHighlightsPrompt,
  buildProjectDigestPrompt,
  buildSkillsPrompt,
  formatItem,
  HOT_ISSUE_BODY_CHARS,
  hasActivity,
  isMajorRelease,
  releaseNotes,
  stripLinkNoise,
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

  it("strips template comments, unanswered fields, checklists, code blocks and link URLs from the body", () => {
    const body =
      "<!-- Please search existing issues first -->\n### Description\n" +
      "Read this first: free tier errors are fixed in [v2](https://github.com/org/repo/releases/tag/v2).\n" +
      "- [x] I searched existing issues\n```\nError: stack trace\n```\n### Version\n_No response_";
    const result = formatItem(makeItem({ body }), HOT_ISSUE_BODY_CHARS);
    expect(result).toContain(
      "Summary: ### Description Read this first: free tier errors are fixed in v2. ### Version",
    );
    expect(result).not.toMatch(/https:|Please search|I searched|stack trace|No response/);
  });

  it("sends a hot issue up to HOT_ISSUE_BODY_CHARS of its body", () => {
    const body = "word ".repeat(400);
    expect(formatItem(makeItem({ body }), HOT_ISSUE_BODY_CHARS)).toContain(
      `${body.slice(0, HOT_ISSUE_BODY_CHARS)}...`,
    );
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
    expect(hasActivity(makeActivity({ hotIssues: [{ ...makeItem(), gain: 12 }] }))).toBe(true);
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
          hotIssues: [{ ...makeItem({ title: "Crash on start" }), gain: 14 }],
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
    expect(prompt).toContain("Gained: +14 comments and 👍 in the last 24h");
    expect(prompt).toContain("[Hacker News] TestTool 1.0 — https://hn/1 (9 points)");
    expect(prompt).toContain("2026-10-04 (last 24h)");
    expect(prompt).toContain("AI coding agents");
  });

  it("gives a hot issue's fix PR and asks for the description only, worded as a report", () => {
    const prompt = buildProjectDigestPrompt(
      [
        makeActivity({
          hotIssues: [{ ...makeItem(), gain: 5, fix: { state: "open", number: 9, url: "https://x/9" } }],
        }),
      ],
      scope,
      "d",
    );
    expect(prompt).toContain("Fix: PR #9 open");
    expect(prompt).toContain('"- **Hot issue:** #<number>: <description>"');
    expect(prompt).toContain("Write no link, label, comment or 👍 count, gain or fix status");
    expect(prompt).toContain('worded as a report ("users report", "an issue says")');
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

describe("releaseNotes", () => {
  // Trimmed from the notes of 2026-10-28; the full OpenCode v2.2.0 body is 35 KB.
  const fixture = (name: string) => fs.readFileSync(new URL(`../fixtures/${name}`, import.meta.url), "utf-8");
  const openshell = fixture("release-openshell-v0.1.6.md");
  const opencode = fixture("release-opencode-v2.2.0.md");

  it("puts the upgrade notes first and keeps the control-connection item whole", () => {
    const notes = releaseNotes(openshell, RELEASE_BODY_CHARS);
    expect(notes).toMatch(/^### Upgrade notes - Gateways now refuse to start/);
    expect(notes).toContain(
      "New sandboxes on Kubernetes, Docker, Podman, and VM now open the control connection from the sandbox to its supervisor",
    );
    expect(notes).toContain("Upgrade the supervisor and sandbox runtime binaries together");
    expect(notes).not.toContain("curl");
    // Quick install lost its text with the install block.
    expect(notes).toContain("`restart_if_restore_fails`. ## OpenShell v0.1.6 ### Bug fixes - The Python SDK");
    expect(notes).not.toContain("Quick install");
    // The CVE fixes are within the budget.
    expect(notes).toContain("RUSTSEC-2026-0385");
  });

  it("puts all three breaking changes ahead of the Highlights", () => {
    const notes = releaseNotes(opencode, RELEASE_BODY_CHARS);
    expect(notes).toMatch(/^### Breaking changes #### `@opencode\/ai` root is now the Promise API/);
    expect(notes).toContain("`@opencode/ai/promise` is removed");
    expect(notes).toContain(
      "The OpenCode GitHub Action is no longer published. Remove it from your workflows.",
    );
    expect(notes).toContain("Plugins that depend on OpenTUI 0.6 fail to install until they upgrade.");
    expect(notes.indexOf("Remove it from your workflows")).toBeLessThan(notes.indexOf("### Highlights"));
    expect(notes).toContain("### Highlights - Create, install and share Desktop plugins (experimental)");
  });

  it("strips link URLs and PR references before counting", () => {
    for (const body of [openshell, opencode]) {
      const notes = releaseNotes(body, RELEASE_BODY_CHARS);
      expect(notes).not.toMatch(/https?:|\]\(|#\d{4}|\( *,| ,/);
      expect(notes.length).toBeLessThanOrEqual(RELEASE_BODY_CHARS);
    }
    expect(releaseNotes(openshell, RELEASE_BODY_CHARS)).toContain(
      "`ResumeBoundaryRequest` field 3 is renamed from `allow_cold_start_fallback` to `restart_if_restore_fails`.",
    );
    expect(releaseNotes(opencode, RELEASE_BODY_CHARS)).toContain("call `refreshHooks()` after adding a hook");
  });

  it("ends on a whole line or sentence, never mid-word", () => {
    const lines = [
      "### Fixes",
      "- First fix is short.",
      "- Second fix is longer. It has two sentences.",
      "- Third fix",
    ].join("\n");
    expect(releaseNotes(lines, 60)).toBe("### Fixes - First fix is short. - Second fix is longer.");
    expect(releaseNotes(lines, 40)).toBe("### Fixes - First fix is short.");
    expect(releaseNotes("A very long first line without any sentence end", 20)).toBe("A very long first");
    // A heading the cut leaves last introduces nothing.
    expect(releaseNotes("- One fix.\n### Features\n- A feature that does not fit", 30)).toBe("- One fix.");
    const cut = releaseNotes(opencode, 1000);
    expect(opencode.replace(/\s+/g, " ")).toContain(cut.slice(-40));
    expect(cut).toMatch(/[.)]$/);
  });

  it("drops contributor lines and the Full Changelog link", () => {
    const body =
      "- Faster startup by @alice in #12\n" +
      "Thanks to @bob and @carol for their help!\n" +
      "## New Contributors\n- @dave made their first contribution in #13\n" +
      "**Full Changelog**: https://github.com/o/r/compare/v1...v2";
    expect(releaseNotes(body, 400)).toBe("- Faster startup");
  });
});

describe("stripLinkNoise", () => {
  it("keeps a link's text and code, drops URLs and reference lists", () => {
    expect(
      stripLinkNoise(
        "- Read [the guide](https://x.dev/g) and call `f()` ([#1](https://x/1), [#2](https://x/2))",
      ),
    ).toMatch(/^- Read the guide and call `f\(\)` +$/);
    expect(stripLinkNoise("See https://x.dev/post or <https://x.dev/a>. (#3, #4)").trim()).toBe(
      "See   or  .",
    );
    expect(stripLinkNoise("![logo](https://x/l.png)Text").trim()).toBe("Text");
    expect(stripLinkNoise("Use `@opencode/ai` by @opencode/ai")).toBe("Use `@opencode/ai` by @opencode/ai");
  });

  it("keeps line breaks", () => {
    expect(stripLinkNoise("a\nb [#5](https://x/5)\nc")).toBe("a\nb  \nc");
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
    expect(result).toContain("None");
  });

  it("heads open PRs as unmerged and leaves off-audience items out", () => {
    const result = buildSkillsPrompt([makeItem()], [], "2026-10-26");
    expect(result).toContain("## Open PRs worth watching");
    expect(result).toContain("an open PR is not a released Skill");
    expect(result).toContain("not about coding agents or data/AI engineering");
    expect(result).not.toContain("## Top Skills");
  });

  it("lists a merged PR as MERGED, under Merged this week, with no 'do not say which'", () => {
    const merged = makeItem({
      number: 1990,
      state: "closed",
      closed_at: "2026-10-24T00:00:00Z",
      merged_at: "2026-10-24T00:00:00Z",
    });
    const result = buildSkillsPrompt([makeItem({ number: 1742 }), merged], [], "2026-10-26");
    expect(result).toContain("#1990 [MERGED]");
    expect(result).toContain("#1742 [OPEN]");
    expect(result).toContain("## Merged this week");
    expect(result).not.toContain("Closed this week");
    expect(result).not.toContain("do not say which");
    expect(result).toContain("open PRs, merged PRs and issues");
  });
});

describe("buildPageHighlightsPrompt note", () => {
  it("a models page without lab or model news says so instead of padding with Spotted rows", () => {
    const p = buildPageHighlightsPrompt("AI Models", "## Spotted", "f", "2026-10-26", NO_MODEL_NEWS_NOTE);
    expect(p).toContain("No lab or model news today.");
    expect(p).toContain("at most 2 bullets");
  });
});
