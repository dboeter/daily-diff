import { describe, it, expect } from "vitest";
import { renderTrackedBlock, syncReadme } from "../readme.ts";
import type { SectionConfig } from "../config.ts";

const section = (title: string, ...repos: [string, string][]): SectionConfig => ({
  title,
  subject: `${title} subject`,
  repos: repos.map(([name, repo]) => ({ id: name.toLowerCase(), repo, name })),
});

const config = {
  agents: section("Agents", ["Alpha", "org/alpha"], ["Beta Long Name", "o/b"]),
  infra: section("Infra", ["Gamma", "org/gamma"]),
  databricks: section("Databricks", ["Delta", "org/delta"]),
  snowflake: section("Snowflake", ["Polaris", "org/polaris"]),
  data_stack: section("Stack", ["DuckDB", "org/duckdb"]),
};

const START = (key: string) => `<!-- tracked:${key} -->`;
const NOTE = "<!-- generated from config.yml: edit config.yml, then run pnpm readme -->";
const END = (key: string) => `<!-- /tracked:${key} -->`;

// ---------------------------------------------------------------------------
// renderTrackedBlock
// ---------------------------------------------------------------------------

describe("renderTrackedBlock", () => {
  it("renders the subject line and a padded table with repo links", () => {
    expect(renderTrackedBlock(config.agents)).toBe(
      [
        "**Agents**: Agents subject.",
        "",
        "| Project        | Repository                                |",
        "| -------------- | ----------------------------------------- |",
        "| Alpha          | [org/alpha](https://github.com/org/alpha) |",
        "| Beta Long Name | [o/b](https://github.com/o/b)             |",
      ].join("\n"),
    );
  });
});

// ---------------------------------------------------------------------------
// syncReadme
// ---------------------------------------------------------------------------

describe("syncReadme", () => {
  const readme = [
    "# Title",
    START("agents"),
    "stale agents table",
    END("agents"),
    "",
    "prose between",
    START("infra"),
    END("infra"),
    START("databricks"),
    END("databricks"),
    START("snowflake"),
    END("snowflake"),
    START("data_stack"),
    END("data_stack"),
    "tail",
  ].join("\n");

  it("replaces every marker block and keeps the rest", () => {
    const out = syncReadme(readme, config);
    expect(out).toContain(
      `${START("agents")}\n${NOTE}\n\n${renderTrackedBlock(config.agents)}\n\n${END("agents")}`,
    );
    expect(out).toContain(
      `${START("infra")}\n${NOTE}\n\n${renderTrackedBlock(config.infra)}\n\n${END("infra")}`,
    );
    expect(out).not.toContain("stale agents table");
    expect(out.startsWith("# Title\n")).toBe(true);
    expect(out).toContain("\nprose between\n");
    expect(out.endsWith("\ntail")).toBe(true);
  });

  it("is idempotent", () => {
    const once = syncReadme(readme, config);
    expect(syncReadme(once, config)).toBe(once);
  });

  it("throws when a marker is missing", () => {
    expect(() => syncReadme(readme.replace(END("infra"), ""), config)).toThrow('markers for "infra"');
  });
});
