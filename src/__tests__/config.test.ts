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

  it("returns defaults when config file does not exist", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    const config = loadConfig("/nonexistent/config.yml");
    expect(config.agents.map((a) => a.id)).toContain("openclaw");
    expect(config.skillsRepo).toBe("anthropics/skills");
    expect(config.infraRepos.length).toBeGreaterThan(0);
  });

  it("loads infra_repos from valid YAML", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(`
infra_repos:
  - id: custom-engine
    repo: org/custom-engine
    name: Custom Engine
`);
    const config = loadConfig("test.yml");
    expect(config.infraRepos).toEqual([
      { id: "custom-engine", repo: "org/custom-engine", name: "Custom Engine" },
    ]);
  });

  it("falls back to defaults for empty infra_repos", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue("infra_repos: []");
    const config = loadConfig("test.yml");
    expect(config.infraRepos.length).toBeGreaterThan(0);
    expect(config.infraRepos[0]!.id).toBe("vllm");
  });

  it("loads agents from valid YAML", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(`
agents:
  - id: custom
    repo: org/custom
    name: Custom Tool
    keywords: [custom tool]
skills_repo: custom/skills
`);
    const config = loadConfig("test.yml");
    expect(config.agents).toEqual([
      { id: "custom", repo: "org/custom", name: "Custom Tool", keywords: ["custom tool"] },
    ]);
    expect(config.skillsRepo).toBe("custom/skills");
  });

  it("falls back to defaults for empty agents", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue("agents: []");
    const config = loadConfig("test.yml");
    expect(config.agents.length).toBeGreaterThan(0);
    expect(config.agents[0]!.id).toBe("claude-code");
  });

  it("falls back to defaults for empty skills_repo", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue("skills_repo: ''");
    const config = loadConfig("test.yml");
    expect(config.skillsRepo).toBe("anthropics/skills");
  });
});
