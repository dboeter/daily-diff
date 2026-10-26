import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect } from "vitest";
import type { GitHubItem } from "../../core/github.ts";
import { loadShownSkills, selectSkillsItems, shownSkillsNumbers } from "../../trending/skills.ts";

const REPO = "anthropics/skills";
const NOW = new Date("2026-10-26T03:00:00Z");

const item = (number: number, updated: string, over: Partial<GitHubItem> = {}): GitHubItem => ({
  number,
  title: `Item ${number}`,
  state: "open",
  user: { login: "a" },
  labels: [],
  created_at: "2026-09-01T00:00:00Z",
  updated_at: updated,
  comments: 5,
  html_url: `https://github.com/${REPO}/pull/${number}`,
  ...over,
});

describe("shownSkillsNumbers / loadShownSkills", () => {
  it("reads the Skills section's links to the skills repo only, not the rest of the page", () => {
    const md =
      "## Radar\n\n[o/r](https://github.com/o/r/pull/5) #5\n\n---\n\n## Skills: open PRs worth watching\n\n" +
      "[PR](https://github.com/anthropics/skills/pull/12) [Issue](https://github.com/anthropics/skills/issues/3) " +
      "[x](https://github.com/other/skills/pull/99)\n\n---\n\n## Models\n\n#77";
    expect([...shownSkillsNumbers(md, REPO)].sort((a, b) => a - b)).toEqual([3, 12]);
  });

  it("reads the 2026-10-19 section's bare #N references: the 8 items the 2026-10-26 page repeated", () => {
    const md = fs.readFileSync(new URL("../fixtures/skills-2026-10-19.md", import.meta.url), "utf-8");
    const shown = shownSkillsNumbers(md, REPO);
    for (const n of [1298, 1245, 1742, 1703, 1771, 492, 228, 556]) expect(shown.has(n)).toBe(true);
  });

  it("reads the page dated exactly a week earlier, and nothing when there is none (a forced mid-week run)", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "skills-"));
    fs.mkdirSync(path.join(dir, "2026-10-26"));
    fs.writeFileSync(
      path.join(dir, "2026-10-26", "ai-trends.md"),
      "## Skills: open PRs worth watching\n\n[PR](https://github.com/anthropics/skills/pull/1742)\n",
    );
    expect([...loadShownSkills(REPO, "2026-11-02", dir)]).toEqual([1742]);
    expect(loadShownSkills(REPO, "2026-11-03", dir).size).toBe(0);
  });
});

describe("selectSkillsItems", () => {
  const data = (prs: GitHubItem[], issues: GitHubItem[] = []) => ({ prs, issues, fetchSuccess: true });

  it("keeps only items updated in the last 7 days", () => {
    // #1771 was last updated 2026-09-16 and still shown on 2026-10-26.
    const out = selectSkillsItems(
      data([item(1771, "2026-09-16T10:00:00Z"), item(1980, "2026-10-25T10:00:00Z")]),
      new Set(),
      NOW,
    );
    expect(out.prs.map((p) => p.number)).toEqual([1980]);
  });

  it("skips an item last week's page showed unless it closed this week", () => {
    const out = selectSkillsItems(
      data(
        [
          item(1742, "2026-10-24T00:00:00Z"),
          item(1298, "2026-10-24T00:00:00Z", { state: "closed", closed_at: "2026-10-23T00:00:00Z" }),
        ],
        [item(492, "2026-10-25T00:00:00Z")],
      ),
      new Set([1742, 1298, 492]),
      NOW,
    );
    expect(out.prs.map((p) => p.number)).toEqual([1298]);
    expect(out.issues).toEqual([]);
  });

  it("leaves nothing when nothing moved, so the section is left out", () => {
    const out = selectSkillsItems(data([item(1, "2026-09-01T00:00:00Z")]), new Set(), NOW);
    expect(out.prs.length + out.issues.length).toBe(0);
    expect(out.fetchSuccess).toBe(true);
  });
});
