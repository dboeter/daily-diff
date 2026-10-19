/**
 * Renders the tracked-repo tables in README.md from config.yml, so a repo swap
 * or a section re-scope is a config edit plus `pnpm readme`.
 *
 * Usage:
 *   pnpm readme           rewrite README.md
 *   pnpm readme --check   exit 1 when README.md is stale (pre-commit, CI)
 */

import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { loadConfig, SECTION_KEYS, type SectionConfig, type SectionKey } from "../core/config.ts";

const README_PATH = "README.md";

const startMarker = (key: SectionKey) => `<!-- tracked:${key} -->`;
const endMarker = (key: SectionKey) => `<!-- /tracked:${key} -->`;
// Written inside each block, so README editors see it next to the table.
const GENERATED_NOTE = "<!-- generated from config.yml: edit config.yml, then run pnpm readme -->";

/** One table row per cell array, padded the way prettier aligns Markdown tables. */
function renderTable(header: string[], rows: string[][]): string {
  const widths = header.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i]!.length)));
  const line = (cells: string[]) => `| ${cells.map((c, i) => c.padEnd(widths[i]!)).join(" | ")} |`;
  return [line(header), line(widths.map((w) => "-".repeat(w))), ...rows.map(line)].join("\n");
}

/** The subject line and the Project/Repository table for one config section. */
export function renderTrackedBlock(section: SectionConfig): string {
  const rows = section.repos.map((r) => [r.name, `[${r.repo}](https://github.com/${r.repo})`]);
  return `**${section.title}**: ${section.subject}.\n\n${renderTable(["Project", "Repository"], rows)}`;
}

/** README with every marker block replaced by the current config; throws when a marker is missing. */
export function syncReadme(readme: string, config: Record<SectionKey, SectionConfig>): string {
  let out = readme;
  for (const key of SECTION_KEYS) {
    const start = out.indexOf(startMarker(key));
    const end = out.indexOf(endMarker(key));
    if (start === -1 || end === -1 || end < start) {
      throw new Error(
        `${README_PATH}: missing or misplaced markers for "${key}" (${startMarker(key)} … ${endMarker(key)})`,
      );
    }
    const block = `${startMarker(key)}\n${GENERATED_NOTE}\n\n${renderTrackedBlock(config[key])}\n\n`;
    out = out.slice(0, start) + block + out.slice(end);
  }
  return out;
}

function main(): void {
  const readme = fs.readFileSync(README_PATH, "utf-8");
  const synced = syncReadme(readme, loadConfig());
  if (process.argv.includes("--check")) {
    if (synced !== readme) {
      console.error(
        `${README_PATH} is stale, run pnpm readme (its tracked-repo tables differ from config.yml)`,
      );
      process.exit(1);
    }
    return;
  }
  if (synced === readme) {
    console.log(`${README_PATH} already matches config.yml`);
    return;
  }
  fs.writeFileSync(README_PATH, synced);
  console.log(`${README_PATH} updated from config.yml`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
