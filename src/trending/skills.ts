/**
 * The Trends page's Skills section: the skills repo's PRs and issues that moved
 * this week. All-time popular items repeated week after week (8 of 11 on
 * 2026-10-26 were on the 2026-10-19 page), so only this week's movement counts.
 */

import fs from "node:fs";
import path from "node:path";
import { DAY_MS, daysBefore } from "../core/date.ts";
import { STAR_GAIN_DAYS, type GitHubItem, type SkillsData } from "../core/github.ts";

/** An item is eligible when updated within this many days. */
export const SKILLS_WINDOW_DAYS = 7;

/**
 * The PR and issue numbers a Trends page's Skills section names: its links to
 * `repo` and its bare `#N` references (the model wrote "#1298" without a link).
 */
export function shownSkillsNumbers(markdown: string, repo: string): Set<number> {
  const section = /^## [^\n]*Skills[^\n]*\n([\s\S]*?)(?=^## |^---|(?![\s\S]))/m.exec(markdown)?.[1] ?? "";
  const escaped = repo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`github\\.com/${escaped}/(?:pull|issues)/(\\d+)|#(\\d+)\\b`, "gi");
  return new Set([...section.matchAll(re)].map((m) => Number(m[1] ?? m[2])));
}

/**
 * The Skills items the Trends page dated exactly STAR_GAIN_DAYS before
 * `dateStr` showed, the same "last week" as 🔥. No such page → empty.
 */
export function loadShownSkills(repo: string, dateStr: string, dir = "digests"): Set<number> {
  const file = path.join(dir, daysBefore(dateStr, STAR_GAIN_DAYS), "ai-trends.md");
  try {
    return shownSkillsNumbers(fs.readFileSync(file, "utf-8"), repo);
  } catch {
    return new Set();
  }
}

/**
 * Title terms of the items in the audience's reach (coding agents, data/AI engineering): the repo's
 * developer skills, evals and triggering, skill distribution, Claude Code sessions, hooks and memory.
 * Titles only: PR templates put "Claude Code", "MCP" or "marketplace" in nearly every body, the
 * off-audience ones included. A new skill whose title names none of these is dropped until added here.
 */
const AUDIENCE_TITLE_RE =
  /skill-creator|claude-api|mcp-builder|\bmcp\b|webapp-testing|run_eval|\beval|trigger|claude code|marketplace|\bplugins?\b|namespace|skill sharing|\bhooks?\b|\bsessions?\b|\bmemory\b/i;

export function isAudienceSkillsItem(item: GitHubItem): boolean {
  return AUDIENCE_TITLE_RE.test(item.title);
}

/**
 * The items updated in the last SKILLS_WINDOW_DAYS whose title is in the audience's reach. A closed item is kept only when it closed (or
 * merged: GitHub sets `closed_at` then too) in the window, so a comment on a PR closed months ago
 * does not put it under "Closed this week". One last week's page showed is kept only when it closed
 * in the window: its state changed.
 */
export function selectSkillsItems(data: SkillsData, shown: Set<number>, now: Date): SkillsData {
  const since = now.getTime() - SKILLS_WINDOW_DAYS * DAY_MS;
  const inWindow = (iso: string | null | undefined) => !!iso && Date.parse(iso) >= since;
  const closedThisWeek = (i: GitHubItem) => inWindow(i.closed_at);
  const keep = (i: GitHubItem) =>
    inWindow(i.updated_at) &&
    isAudienceSkillsItem(i) &&
    (i.state !== "closed" || closedThisWeek(i)) &&
    (!shown.has(i.number) || closedThisWeek(i));
  return { ...data, prs: data.prs.filter(keep), issues: data.issues.filter(keep) };
}
