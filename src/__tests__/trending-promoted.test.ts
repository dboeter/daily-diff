import { describe, it, expect } from "vitest";
import {
  promotedRecord,
  promotedRepos,
  PROMOTED_PER_SECTION,
  type PromotedRecord,
} from "../trending/promoted.ts";
import { matchProjectNews } from "../reports/agent-news.ts";
import type { RepoConfig } from "../core/github.ts";
import type { Category } from "../trending/rank.ts";
import type { HnData } from "../sources/hn.ts";

const DATE = "2026-10-20";
const record = (repos: [string, Category][], date = "2026-10-19"): { promoted: PromotedRecord } => ({
  promoted: { date, repos },
});

describe("promotedRecord", () => {
  it("takes the category-table repos in table order, not the Radar", () => {
    const row = (fullName: string) => ({ fullName }) as never;
    const rec = promotedRecord(
      {
        categories: [
          { category: "coding_agent", rows: [row("a/one"), row("a/two")] },
          { category: "agent_tooling", rows: [row("b/tool")] },
        ],
        radar: [row("r/new")],
      } as never,
      DATE,
    );
    expect(rec).toEqual({
      date: DATE,
      repos: [
        ["a/one", "coding_agent"],
        ["a/two", "coding_agent"],
        ["b/tool", "agent_tooling"],
      ],
    });
  });
});

describe("promotedRepos", () => {
  it("maps categories to sections, leaves out other_agent, matches news only by owner/repo", () => {
    const out = promotedRepos(
      record([
        ["Cursor/Plugins", "coding_agent"],
        ["x/helper", "other_agent"],
        ["y/harness", "harness_framework"],
        ["z/swarm", "multi_agent"],
      ]),
      DATE,
      [],
    );
    expect(out.agents.map((r) => r.repo)).toEqual(["Cursor/Plugins"]);
    expect(out.infra.map((r) => r.repo)).toEqual(["y/harness", "z/swarm"]);
    expect(out.agents[0]).toEqual({
      id: "trending-cursor-plugins",
      repo: "Cursor/Plugins",
      name: "Cursor/Plugins",
      keywords: ["Cursor/Plugins"],
    });
  });

  it("skips repos already tracked, case-insensitively", () => {
    const tracked: RepoConfig[] = [{ id: "cline", repo: "cline/cline", name: "Cline" }];
    const out = promotedRepos(record([["Cline/Cline", "coding_agent"]]), DATE, tracked);
    expect(out.agents).toEqual([]);
  });

  it("caps each section, round-robin over its categories", () => {
    const repos: [string, Category][] = [
      ...[1, 2, 3, 4, 5, 6].map((i): [string, Category] => [`h/${i}`, "harness_framework"]),
      ["t/1", "agent_tooling"],
      ["m/1", "multi_agent"],
    ];
    const out = promotedRepos(record(repos), DATE, []);
    expect(out.infra).toHaveLength(PROMOTED_PER_SECTION);
    expect(out.infra.map((r) => r.repo)).toEqual(["h/1", "t/1", "m/1", "h/2", "h/3"]);
  });

  it("ignores a record older than two weeks, a future one, or none", () => {
    const repos: [string, Category][] = [["a/b", "coding_agent"]];
    expect(promotedRepos(record(repos, "2026-10-06"), DATE, []).agents).toHaveLength(1);
    expect(promotedRepos(record(repos, "2026-10-05"), DATE, []).agents).toEqual([]);
    expect(promotedRepos(record(repos, "2026-10-21"), DATE, []).agents).toEqual([]);
    expect(promotedRepos({}, DATE, [])).toEqual({ agents: [], infra: [] });
  });

  it("a promoted repo with an ordinary-word name does not match news using the word", () => {
    const [plugins] = promotedRepos(record([["cursor/plugins", "coding_agent"]]), DATE, []).agents;
    const story = (title: string) => ({ title, hnUrl: `https://hn/${title}`, points: 1, comments: 1 });
    const hn = {
      stories: [story("Plugins considered harmful"), story("cursor/plugins hits 12k stars")],
    } as unknown as HnData;
    const news = matchProjectNews([plugins!], { hn });
    expect(news.get(plugins!.id)?.map((n) => n.title)).toEqual(["cursor/plugins hits 12k stars"]);
  });
});
