import { describe, it, expect, vi, afterEach } from "vitest";
import fs from "node:fs";
import { toRepoConfig, loadConfig } from "../config.ts";

// ---------------------------------------------------------------------------
// toRepoConfig
// ---------------------------------------------------------------------------

describe("toRepoConfig", () => {
  it("converts a basic entry", () => {
    const result = toRepoConfig({ id: "test", repo: "org/test", name: "Test" });
    expect(result).toEqual({ id: "test", repo: "org/test", name: "Test" });
  });

  it("includes keywords when non-empty", () => {
    const result = toRepoConfig({ id: "pi", repo: "org/pi", name: "Pi", keywords: ["pi agent"] });
    expect(result).toEqual({ id: "pi", repo: "org/pi", name: "Pi", keywords: ["pi agent"] });
  });

  it("omits keywords when empty", () => {
    const result = toRepoConfig({ id: "test", repo: "org/test", name: "Test", keywords: [] });
    expect(result).not.toHaveProperty("keywords");
  });
});

// ---------------------------------------------------------------------------
// loadConfig
// ---------------------------------------------------------------------------

describe("loadConfig", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const VALID = `
agents:
  title: Agents Title
  subject: agents subject
  repos:
    - id: custom
      repo: org/custom
      name: Custom Tool
      keywords: [custom tool]
skills_repo: custom/skills
infra:
  title: Infra Title
  subject: infra subject
  repos:
    - id: custom-engine
      repo: org/custom-engine
      name: Custom Engine
`;

  function load(yamlText: string) {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(yamlText);
    return loadConfig("test.yml");
  }

  it("loads both sections and skills_repo from valid YAML", () => {
    expect(load(VALID)).toEqual({
      agents: {
        title: "Agents Title",
        subject: "agents subject",
        repos: [{ id: "custom", repo: "org/custom", name: "Custom Tool", keywords: ["custom tool"] }],
      },
      skillsRepo: "custom/skills",
      infra: {
        title: "Infra Title",
        subject: "infra subject",
        repos: [{ id: "custom-engine", repo: "org/custom-engine", name: "Custom Engine" }],
      },
    });
  });

  it("throws when the file does not exist", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    expect(() => loadConfig("/nonexistent/config.yml")).toThrow("not found");
  });

  it("throws when a section is missing", () => {
    expect(() => load(VALID.replace(/infra:[\s\S]*$/, ""))).toThrow('missing section "infra"');
  });

  it("throws when repos is empty", () => {
    expect(() =>
      load(VALID.replace(/repos:\n {4}- id: custom\n[\s\S]*?skills_repo/, "repos: []\nskills_repo")),
    ).toThrow("agents.repos must be a non-empty list");
  });

  it("throws when title or subject is missing", () => {
    expect(() => load(VALID.replace("  title: Infra Title\n", ""))).toThrow(
      "infra.title must be a non-empty string",
    );
    expect(() => load(VALID.replace("  subject: agents subject\n", ""))).toThrow(
      "agents.subject must be a non-empty string",
    );
  });

  it("throws when a repo entry lacks a field", () => {
    expect(() => load(VALID.replace("      name: Custom Engine\n", ""))).toThrow(
      "infra.repos[0] needs id, repo and name",
    );
  });

  it("throws when skills_repo is empty", () => {
    expect(() => load(VALID.replace("skills_repo: custom/skills", "skills_repo: ''"))).toThrow(
      "skills_repo must be a non-empty string",
    );
  });
});
