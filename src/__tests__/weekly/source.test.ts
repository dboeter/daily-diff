import { describe, it, expect } from "vitest";
import type { Candidate } from "../../reports/candidates.ts";
import { MAX_TEXT_CHARS } from "../../reports/candidates.ts";
import { buildWeekSource, CUT_MARK, pageRows, type WeekDay } from "../../weekly/source.ts";

const candidate = (over: Partial<Candidate>): Candidate => ({
  page: "ai-agents",
  kind: "story",
  source: "Hacker News",
  title: "A story",
  url: "https://example.com/story",
  published: "2026-11-10T08:00:00Z",
  text: "The story's own description.",
  ...over,
});

const day = (date: string, candidates: Candidate[], pages: Record<string, string>): WeekDay => ({
  date,
  candidates,
  pages,
});

/** No GitHub object: every item keeps its saved text. */
const noGitHub = () => Promise.resolve(undefined);

describe("buildWeekSource", () => {
  it("lists a shown item with its link, the row's section and counts, and its own text", async () => {
    const story = candidate({ discussion: "https://news.ycombinator.com/item?id=1" });
    const page = [
      "## Spotted",
      "",
      "| Story | Summary |",
      "| [A story](https://example.com/story) · [335 points, 242 comments](https://news.ycombinator.com/item?id=1) | A model's summary. |",
    ].join("\n");

    const { text, items } = await buildWeekSource(
      [day("2026-11-10", [story], { "ai-agents": page })],
      [],
      noGitHub,
    );

    expect(items).toBe(1);
    expect(text).toBe(
      [
        "===== 2026-11-10 · AI Agents =====",
        "",
        "### A story",
        "",
        "kind: story · source: Hacker News · published: 2026-11-10 · link: https://example.com/story · discussion: https://news.ycombinator.com/item?id=1",
        "digest: shown under AI Agents › Spotted · 335 points, 242 comments",
        "text: The story's own description.",
      ].join("\n"),
    );
    // The row's summary is a model's text: it never reaches the writer.
    expect(text).not.toContain("A model's summary");
  });

  it("leaves out a candidate no page showed, and one only a Highlight links", async () => {
    const unshown = candidate({ title: "Unshown", url: "https://example.com/unshown" });
    const highlighted = candidate({ title: "Highlighted", url: "https://example.com/highlighted" });
    const page =
      "## Highlights\n\n- [Highlighted](https://example.com/highlighted) changed.\n\n## Spotted\n\nNothing.";

    const { items } = await buildWeekSource(
      [day("2026-11-10", [unshown, highlighted], { "ai-agents": page })],
      [],
      noGitHub,
    );

    expect(items).toBe(0);
  });

  it("lists an item once, on the first day a page showed it", async () => {
    const story = candidate({});
    const page = "## Spotted\n\n| [A story](https://example.com/story) |";

    const { text, items } = await buildWeekSource(
      [day("2026-11-10", [story], { "ai-agents": page }), day("2026-11-11", [story], { "ai-agents": page })],
      [],
      noGitHub,
    );

    expect(items).toBe(1);
    expect(text).toContain("===== 2026-11-10 · AI Agents =====");
    expect(text).not.toContain("2026-11-11");
  });

  it("tells apart two notes that share a link by the title on their row", async () => {
    const link = "https://docs.cloud.google.com/bigquery/docs/release-notes#November_11_2026";
    const note = (title: string, text: string) =>
      candidate({ page: "ai-data", kind: "vendor-note", source: "BigQuery", title, url: link, text });
    const page = [
      "## Azure / Fabric & GCP",
      "",
      `| 2026-11-11 | [Project caps are generally available](${link}) | Summary. |`,
    ].join("\n");

    const { text, items } = await buildWeekSource(
      [
        day(
          "2026-11-11",
          [note("Project caps are generally available", "Caps."), note("Another note of that day", "Other.")],
          { "ai-data": page },
        ),
      ],
      [],
      noGitHub,
    );

    expect(items).toBe(1);
    expect(text).toContain("text: Caps.");
    expect(text).not.toContain("Another note of that day");
  });

  it("puts the row's marker in the digest line: a deprecation and an AI feature", async () => {
    const note = candidate({ page: "ai-data", kind: "vendor-note", source: "Azure Databricks" });
    const page = "## Databricks\n\n| 2026-11-10 | ⚠️ 🤖 [A story](https://example.com/story) | Summary. |";

    const { text } = await buildWeekSource([day("2026-11-10", [note], { "ai-data": page })], [], noGitHub);

    expect(text).toContain("digest: shown under Data Engineering › Databricks · ⚠️ · 🤖");
  });

  it("lists a note that is also an open Action required row once, as the note, with the end date", async () => {
    const note = candidate({
      page: "ai-data",
      kind: "vendor-note",
      source: "Azure Databricks",
      title: "Gemini 3.6 Flash will be retired",
      url: "https://example.com/retire",
      text: "The vendor's own text.",
    });
    const action = {
      ...note,
      kind: "open-action" as const,
      published: "",
      ends: "2026-11-19",
      text: "Row summary.",
    };
    const page = [
      "## Action required",
      "",
      "| 2026-11-19 | Databricks | [Gemini 3.6 Flash will be retired](https://example.com/retire) | Migrate. |",
      "",
      "## Databricks",
      "",
      "| 2026-11-10 | [Gemini 3.6 Flash will be retired](https://example.com/retire) | Summary. |",
    ].join("\n");

    const { text, items } = await buildWeekSource(
      [day("2026-11-10", [note, action], { "ai-data": page })],
      [note],
      noGitHub,
    );

    expect(items).toBe(1);
    expect(text).toContain("kind: vendor-note");
    expect(text).toContain("ends: 2026-11-19");
    expect(text).toContain("text: The vendor's own text.");
    expect(text).not.toContain("Row summary.");
  });

  it("gives a carried Action required row the text of the note an earlier week saved", async () => {
    const note = candidate({
      page: "ai-data",
      kind: "vendor-note",
      source: "Azure Databricks",
      title: "Genie endpoint end of life",
      url: "https://example.com/genie",
      text: "The vendor's own text.",
    });
    const action = {
      ...note,
      kind: "open-action" as const,
      published: "",
      ends: "2026-11-30",
      text: "Row summary.",
    };
    const page =
      "## Action required\n\n| 2026-11-30 | Databricks | [Genie endpoint end of life](https://example.com/genie) | Migrate. |";
    const week = [day("2026-11-10", [action], { "ai-data": page })];

    const withNote = await buildWeekSource(week, [note], noGitHub);
    expect(withNote.text).toContain("text: The vendor's own text.");

    // No saved note (it predates candidates.json): the row summary, labelled as the digest's.
    const without = await buildWeekSource(week, [], noGitHub);
    expect(without.text).toContain(
      "text: (the digest's own summary of this note; the vendor's text is not saved) Row summary.",
    );
  });

  it("takes a release's notes whole from GitHub, on one line, and marks a cut text", async () => {
    const release = candidate({
      kind: "release",
      source: "owner/repo",
      title: "repo v1.2.0",
      url: "https://github.com/owner/repo/releases/tag/v1.2.0",
      text: "Saved, cut notes.",
    });
    const page =
      "## Coding Agents\n\n- **Release:** [v1.2.0](https://github.com/owner/repo/releases/tag/v1.2.0)";
    const week = [day("2026-11-10", [release], { "ai-agents": page })];
    const asked: string[] = [];
    const github = (body: string) => (apiPath: string) => {
      asked.push(apiPath);
      return Promise.resolve({ body });
    };

    const short = await buildWeekSource(week, [], github("## Changes\n\n- Added a flag.\n- Fixed a crash."));
    expect(asked).toEqual(["repos/owner/repo/releases/tags/v1.2.0"]);
    expect(short.text).toMatch(/\ntext: .*Added a flag\. .*Fixed a crash\.$/);
    expect(short.text).not.toContain(CUT_MARK);

    const long = await buildWeekSource(
      week,
      [],
      github(Array.from({ length: 400 }, (_, i) => `- Change number ${i} of this release.`).join("\n")),
    );
    expect(long.text.endsWith(CUT_MARK)).toBe(true);
    expect(long.text.length).toBeLessThan(7000);

    // A failed call: the text the day saved.
    const failed = await buildWeekSource(week, [], noGitHub);
    expect(failed.text).toContain("text: Saved, cut notes.");
  });

  it("keeps the saved text when GitHub answers with something that is no release or issue", async () => {
    const release = candidate({
      kind: "release",
      source: "owner/repo",
      title: "repo v1.2.0",
      url: "https://github.com/owner/repo/releases/tag/v1.2.0",
      text: "Saved notes.",
    });
    const issue = candidate({
      kind: "hot-issue",
      source: "owner/repo",
      title: "A bug",
      url: "https://github.com/owner/repo/issues/5",
      text: "Saved body.",
    });
    const page = [
      "## Coding Agents",
      "",
      "- **Release:** [v1.2.0](https://github.com/owner/repo/releases/tag/v1.2.0)",
      "- [#5](https://github.com/owner/repo/issues/5): A bug.",
    ].join("\n");
    const week = [day("2026-11-10", [release, issue], { "ai-agents": page })];

    for (const answer of [{ message: "Moved Permanently" }, { body: 5 }, "text", null, []]) {
      const { text } = await buildWeekSource(week, [], () => Promise.resolve(answer));
      expect(text).toContain("text: Saved notes.");
      expect(text).toContain("text: Saved body.");
    }
  });

  it("takes a hot issue's body whole from GitHub, without its template lines", async () => {
    const issue = candidate({
      kind: "hot-issue",
      source: "owner/repo",
      title: "A bug",
      url: "https://github.com/owner/repo/issues/5",
      text: "Saved body.",
    });
    const page =
      "## Coding Agents\n\n- [#5](https://github.com/owner/repo/issues/5): A bug. (12 comments, 3 👍)";
    const asked: string[] = [];

    const { text } = await buildWeekSource(
      [day("2026-11-10", [issue], { "ai-agents": page })],
      [],
      (apiPath) => {
        asked.push(apiPath);
        return Promise.resolve({ body: "<!-- template -->\nThe agent loops.\n\nSummary: it never stops." });
      },
    );

    expect(asked).toEqual(["repos/owner/repo/issues/5"]);
    expect(text).toMatch(/\ntext: The agent loops\. Summary: it never stops\.$/);
    expect(text).toContain("digest: shown under AI Agents › Coding Agents · 12 comments, 3 👍");
  });

  it("marks a saved text of the cap's length as cut, and an empty one as no text", async () => {
    const full = candidate({ text: "x".repeat(MAX_TEXT_CHARS) });
    const empty = candidate({ title: "No text", url: "https://example.com/none", text: "" });
    const page =
      "## Spotted\n\n| [A story](https://example.com/story) |\n| [No text](https://example.com/none) |";

    const { text } = await buildWeekSource(
      [day("2026-11-10", [full, empty], { "ai-agents": page })],
      [],
      noGitHub,
    );

    expect(text).toContain(`${"x".repeat(MAX_TEXT_CHARS)}${CUT_MARK}`);
    expect(text).toContain("text: (the source gave no text)");
  });

  it("ends with the Trends tables and AI Policy's latest Coming up, without the model's prose", async () => {
    const trends = [
      "# Trends 2026-11-16",
      "",
      "> Sources: GitHub | Generated: 01:00 UTC",
      "",
      "---",
      "",
      "## Highlights",
      "",
      "- A model's highlight.",
      "",
      "## Models",
      "",
      "| # | Model | Tokens |",
      "| 1 | [a/model](https://openrouter.ai/a/model) | 2.55T |",
      "",
      "## Signals",
      "",
      "- A model's signal.",
    ].join("\n");
    const policy = (row: string) => `## Coming up\n\n| Date | Source | Item |\n${row}\n\n---\n*footer*`;

    const { text } = await buildWeekSource(
      [
        day("2026-11-15", [], { "ai-policy": policy("| 2026-12-01 | EU | An older row |") }),
        day("2026-11-16", [], {
          "ai-trends": trends,
          "ai-policy": policy("| 2026-12-02 | EU | Art. 50(2) transition ends |"),
        }),
      ],
      [],
      noGitHub,
    );

    expect(text).toBe(
      [
        "===== 2026-11-16 · Trends (weekly tables) =====",
        "",
        "## Models",
        "",
        "| # | Model | Tokens |",
        "| 1 | [a/model](https://openrouter.ai/a/model) | 2.55T |",
        "",
        "===== 2026-11-16 · AI Policy: dates (code-rendered) =====",
        "",
        "## Coming up",
        "",
        "| Date | Source | Item |",
        "| 2026-12-02 | EU | Art. 50(2) transition ends |",
      ].join("\n"),
    );
  });
});

describe("pageRows", () => {
  it("drops the page's head, the report bar, the footer and the Skills Takeaway", () => {
    const page = [
      "# Trends 2026-11-16",
      "",
      "[⬛ Overview](https://example.com/#2026-11-16) · **🟫 Trends**",
      "",
      "> Sources: GitHub | Generated: 01:00 UTC",
      "",
      "---",
      "",
      "## Skills: PRs and requests this week",
      "",
      "### Open",
      "",
      "- A pull request.",
      "",
      "### Takeaway",
      "",
      "A model's conclusion.",
      "",
      "---",
      "*This digest is auto-generated by [Daily Diff](https://github.com/owner/repo).*",
    ].join("\n");

    expect(pageRows(page)).toBe("## Skills: PRs and requests this week\n\n### Open\n\n- A pull request.");
  });
});
