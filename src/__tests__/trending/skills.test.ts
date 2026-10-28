import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect } from "vitest";
import type { GitHubItem } from "../../core/github.ts";
import {
  isAudienceSkillsItem,
  loadShownSkills,
  selectSkillsItems,
  shownSkillsNumbers,
} from "../../trending/skills.ts";

const REPO = "anthropics/skills";
const NOW = new Date("2026-10-26T03:00:00Z");

const item = (number: number, updated: string, over: Partial<GitHubItem> = {}): GitHubItem => ({
  number,
  title: `skill-creator: item ${number}`,
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
      "## Radar\n\n[o/r](https://github.com/o/r/pull/5) #5\n\n---\n\n## Skills: PRs and requests this week\n\n" +
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

  const merged = (at: string) => ({ state: "closed", closed_at: at, merged_at: at });

  it("drops a closed item that closed before the window, however recently it was updated", () => {
    const out = selectSkillsItems(
      data([
        item(900, "2026-10-25T00:00:00Z", merged("2026-06-01T00:00:00Z")),
        item(901, "2026-10-25T00:00:00Z", merged("2026-10-24T00:00:00Z")),
        item(902, "2026-10-25T00:00:00Z"),
      ]),
      new Set(),
      NOW,
    );
    expect(out.prs.map((p) => p.number)).toEqual([901, 902]);
  });

  it("skips an item last week's page showed unless it closed this week", () => {
    const out = selectSkillsItems(
      data(
        [
          item(1742, "2026-10-24T00:00:00Z"),
          item(1298, "2026-10-24T00:00:00Z", merged("2026-10-23T00:00:00Z")),
        ],
        [item(492, "2026-10-25T00:00:00Z")],
      ),
      new Set([1742, 1298, 492]),
      NOW,
    );
    expect(out.prs.map((p) => p.number)).toEqual([1298]);
    expect(out.issues).toEqual([]);
  });

  describe("a PR closed without merging", () => {
    // 2026-10-28: #1961 and the other 6 "Closed this week" PRs were all closed unmerged, yet read as shipped.
    const unmerged = { state: "closed", closed_at: "2026-10-24T00:00:00Z", merged_at: null };

    it("is left out, while a PR merged this week is kept", () => {
      const out = selectSkillsItems(
        data([
          item(1961, "2026-10-25T00:00:00Z", unmerged),
          item(1990, "2026-10-25T00:00:00Z", merged("2026-10-24T00:00:00Z")),
        ]),
        new Set(),
        NOW,
      );
      expect(out.prs.map((p) => p.number)).toEqual([1990]);
    });

    it("is left out when last week's page showed it open", () => {
      const out = selectSkillsItems(
        data([item(1961, "2026-10-25T00:00:00Z", unmerged)]),
        new Set([1961]),
        NOW,
      );
      expect(out.prs).toEqual([]);
    });

    it("leaves a closed issue, which has no merged_at, to its closed_at", () => {
      const issue = item(556, "2026-10-25T00:00:00Z", {
        state: "closed",
        closed_at: "2026-10-24T00:00:00Z",
        html_url: `https://github.com/${REPO}/issues/556`,
      });
      expect(selectSkillsItems(data([], [issue]), new Set(), NOW).issues.map((i) => i.number)).toEqual([556]);
    });
  });

  it("leaves nothing when nothing moved, so the section is left out", () => {
    const out = selectSkillsItems(data([item(1, "2026-09-01T00:00:00Z")]), new Set(), NOW);
    expect(out.prs.length + out.issues.length).toBe(0);
    expect(out.fetchSuccess).toBe(true);
  });

  /** The eleven items of the 2026-10-26 page, with their GitHub titles. */
  const PAGE_2026_10_26: [number, string, boolean][] = [
    [1742, "fix(mcp-builder): support mcp>=2 streamable_http_client import and custom headers", true],
    [1298, "fix(skill-creator): isolate trigger evals and handle Windows and runtime failures", true],
    [1245, "Add notion-spec-to-implementation and quantitative-resume-auditor skills", false],
    [1771, "feat(skills): add proofcore-contract-auditor for smart contract notarization", false],
    [1703, "Add md2video-audio skill", false],
    [
      492,
      "Security: Community skills distributed under anthropic/ namespace enable trust boundary abuse",
      true,
    ],
    [228, "Enable org-wide skill sharing in Claude.ai", true],
    [556, "run_eval.py: claude -p never triggers skills/commands (0% trigger rate across all queries)", true],
    [1980, "webapp-testing: avoid shell=True in with_server.py", true],
    [1681, "fix(skill-creator): support direct execution of package_skill.py and update usage paths", true],
    [525, "Add pyxel skill for retro game development", false],
  ];

  it("drops the off-audience items of the 2026-10-26 page (blockchain, resumes, video, games)", () => {
    for (const [number, title, kept] of PAGE_2026_10_26) {
      expect(isAudienceSkillsItem(item(number, NOW.toISOString(), { title })), title).toBe(kept);
    }
  });

  it("leaves nothing when every item is off-audience, so the section and its Takeaway are left out", () => {
    const off = PAGE_2026_10_26.filter(([, , kept]) => !kept).map(([n, title]) =>
      item(n, "2026-10-25T00:00:00Z", { title }),
    );
    const spam = item(2069, "2026-10-25T00:00:00Z", { title: "Motiongeraphy" });
    const out = selectSkillsItems(data(off, [spam]), new Set(), NOW);
    expect(out.prs.length + out.issues.length).toBe(0);
  });
});
