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

type RawConfig = Partial<Record<SectionKey, RawSection>> & { skills_repo?: unknown };

/** A report over a list of repos: the daily agents report or the weekly infra one. */
export interface SectionConfig {
  /** Report heading and GitHub issue title, e.g. "AI Agents Digest". */
  title: string;
  /** What the projects are, for the LLM prompt and README.md. */
  subject: string;
  repos: RepoConfig[];
}

export interface RadarConfig extends Record<SectionKey, SectionConfig> {
  skillsRepo: string;
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

  const counts = SECTION_KEYS.map((key) => `${sections[key].repos.length} ${key}`).join(", ");
  console.log(`[config] Loaded from ${configPath}: ${counts}`);

  return { ...sections, skillsRepo };
}
