/**
 * Loads and validates Daily Diff configuration from config.yml, the only list
 * of tracked repos. There are no built-in defaults: a missing file or section
 * throws, so a typo cannot silently swap in a stale list.
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import type { RepoConfig } from "./github.ts";

// ---------------------------------------------------------------------------
// Schema types
// ---------------------------------------------------------------------------

interface RawRepoEntry {
  id: string;
  repo: string;
  name: string;
  keywords?: string[];
}

interface RawSection {
  title?: unknown;
  subject?: unknown;
  repos?: unknown;
}

/**
 * The config.yml sections that are reports over a list of repos. Adding one here
 * adds it to the loader, `RadarConfig` and the README tables (`src/readme.ts`).
 */
export const SECTION_KEYS = ["agents", "infra"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

type RawConfig = Partial<Record<SectionKey, RawSection>> & { skills_repo?: unknown; policy?: unknown };

/** A group of tracked repos: a section of the daily agents report. */
export interface SectionConfig {
  /** The section's heading in the agents report, e.g. "Agent Tooling". */
  title: string;
  /** What the projects are, for the LLM prompt and README.md. */
  subject: string;
  repos: RepoConfig[];
}

/** A news feed of the policy report. */
export const JURISDICTIONS = ["eu", "nl", "us_federal", "us_states", "other"] as const;
export type Jurisdiction = (typeof JURISDICTIONS)[number];

export interface PolicyFeed {
  name: string;
  url: string;
  /** Whose policy the feed covers; US items also get the impact question. */
  jurisdiction: Jurisdiction;
  /**
   * A low-volume feed whose items need not name AI (a fine for automated
   * decision-making), so every item goes to Jev. Without Jev it is dropped for the run.
   */
  jevOnly: boolean;
  /** `kind: news`: news and commentary, reported in its own section, not the jurisdiction tables. */
  news: boolean;
}

/** A dated milestone for the policy report's Upcoming deadlines section. */
export interface PolicyCalendarEntry {
  /** ISO date. */
  date: string;
  label: string;
  link: string;
}

/** The policy report (config.yml `policy`). */
export interface PolicyConfig {
  /** Who the report is for; the relevance questions read it. */
  readerProfile: string;
  /** Files that always appear when they move, per jurisdiction. Lists may be empty. */
  watchlist: { eu: string[]; nl: string[]; usFederal: string[]; usStates: string[] };
  feeds: PolicyFeed[];
  /** May be empty. */
  calendar: PolicyCalendarEntry[];
}

export interface RadarConfig extends Record<SectionKey, SectionConfig> {
  skillsRepo: string;
  policy: PolicyConfig;
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

export function toRepoConfig(e: RawRepoEntry): RepoConfig {
  return {
    id: e.id,
    repo: e.repo,
    name: e.name,
    ...(e.keywords?.length ? { keywords: e.keywords.map(String) } : {}),
  };
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

function toSection(raw: RawSection | undefined, key: string, file: string): SectionConfig {
  if (!raw || typeof raw !== "object") throw new Error(`${file}: missing section "${key}"`);
  const { title, subject, repos } = raw;
  if (!nonEmptyString(title)) throw new Error(`${file}: ${key}.title must be a non-empty string`);
  if (!nonEmptyString(subject)) throw new Error(`${file}: ${key}.subject must be a non-empty string`);
  if (!Array.isArray(repos) || repos.length === 0) {
    throw new Error(`${file}: ${key}.repos must be a non-empty list`);
  }
  const entries: RawRepoEntry[] = repos;
  entries.forEach((e, i) => {
    if (!nonEmptyString(e?.id) || !nonEmptyString(e.repo) || !nonEmptyString(e.name)) {
      throw new Error(`${file}: ${key}.repos[${i}] needs id, repo and name`);
    }
  });
  return { title: title.trim(), subject: subject.trim(), repos: entries.map(toRepoConfig) };
}

const WATCHLIST_KEYS = { eu: "eu", nl: "nl", usFederal: "us_federal", usStates: "us_states" } as const;

function toPolicy(raw: unknown, file: string): PolicyConfig {
  if (!raw || typeof raw !== "object") throw new Error(`${file}: missing section "policy"`);
  const { reader_profile, watchlist, feeds, calendar } = raw as Record<string, unknown>;
  if (!nonEmptyString(reader_profile)) {
    throw new Error(`${file}: policy.reader_profile must be a non-empty string`);
  }
  const lists = (watchlist ?? {}) as Record<string, unknown>;
  const entries = Object.entries(WATCHLIST_KEYS).map(([key, yamlKey]) => {
    const list = lists[yamlKey];
    if (!Array.isArray(list)) throw new Error(`${file}: policy.watchlist.${yamlKey} must be a list`);
    return [key, list.map(String)];
  });
  if (!Array.isArray(feeds)) throw new Error(`${file}: policy.feeds must be a list`);
  const rawFeeds: {
    name?: string;
    url?: string;
    jurisdiction?: string;
    jev_only?: unknown;
    kind?: unknown;
  }[] = feeds;
  rawFeeds.forEach((f, i) => {
    if (!nonEmptyString(f?.name) || !nonEmptyString(f.url)) {
      throw new Error(`${file}: policy.feeds[${i}] needs name and url`);
    }
    if (!(JURISDICTIONS as readonly unknown[]).includes(f.jurisdiction)) {
      throw new Error(`${file}: policy.feeds[${i}].jurisdiction must be one of ${JURISDICTIONS.join(", ")}`);
    }
    if (f.kind !== undefined && f.kind !== "news")
      throw new Error(`${file}: policy.feeds[${i}].kind must be news`);
  });
  if (!Array.isArray(calendar)) throw new Error(`${file}: policy.calendar must be a list`);
  // js-yaml reads an unquoted 2026-12-02 as a Date.
  const day = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v ?? ""));
  const rawCalendar: { date?: unknown; label?: unknown; link?: unknown }[] = calendar;
  const calendarEntries = rawCalendar.map((c, i) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day(c?.date)) || !nonEmptyString(c.label) || !nonEmptyString(c.link)) {
      throw new Error(`${file}: policy.calendar[${i}] needs date (YYYY-MM-DD), label and link`);
    }
    return { date: day(c.date), label: c.label.trim(), link: c.link.trim() };
  });
  return {
    readerProfile: reader_profile.trim(),
    watchlist: Object.fromEntries(entries) as PolicyConfig["watchlist"],
    feeds: rawFeeds.map((f) => ({
      name: f.name!.trim(),
      url: f.url!.trim(),
      jurisdiction: f.jurisdiction as Jurisdiction,
      jevOnly: f.jev_only === true,
      news: f.kind === "news",
    })),
    calendar: calendarEntries,
  };
}

export function loadConfig(configPath = "config.yml"): RadarConfig {
  const resolved = path.resolve(configPath);
  if (!fs.existsSync(resolved)) throw new Error(`${configPath} not found`);

  const raw = (yaml.load(fs.readFileSync(resolved, "utf-8")) ?? {}) as RawConfig;

  const sections = Object.fromEntries(
    SECTION_KEYS.map((key) => [key, toSection(raw[key], key, configPath)]),
  ) as Record<SectionKey, SectionConfig>;
  if (!nonEmptyString(raw.skills_repo))
    throw new Error(`${configPath}: skills_repo must be a non-empty string`);
  const skillsRepo = raw.skills_repo.trim();
  const policy = toPolicy(raw.policy, configPath);

  const counts = SECTION_KEYS.map((key) => `${sections[key].repos.length} ${key}`).join(", ");
  console.log(`[config] Loaded from ${configPath}: ${counts}`);

  return { ...sections, skillsRepo, policy };
}
