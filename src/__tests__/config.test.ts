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
policy:
  reader_profile: A practitioner.
  watchlist:
    eu: [ai-act]
    nl: []
    us_federal: []
    us_states: []
  feeds:
    - name: Commission
      url: https://example.eu/rss.xml
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
      policy: {
        readerProfile: "A practitioner.",
        watchlist: { eu: ["ai-act"], nl: [], usFederal: [], usStates: [] },
        feeds: [{ name: "Commission", url: "https://example.eu/rss.xml" }],
      },
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

  it("throws when the policy section or its reader profile is missing", () => {
    expect(() => load(VALID.replace(/policy:[\s\S]*?infra:/, "infra:"))).toThrow('missing section "policy"');
    expect(() => load(VALID.replace("  reader_profile: A practitioner.\n", ""))).toThrow(
      "policy.reader_profile must be a non-empty string",
    );
  });

  it("throws when a policy watchlist is not a list", () => {
    expect(() => load(VALID.replace("    nl: []\n", ""))).toThrow("policy.watchlist.nl must be a list");
  });

  it("throws when a policy feed lacks a name or url", () => {
    expect(() => load(VALID.replace("      url: https://example.eu/rss.xml\n", ""))).toThrow(
      "policy.feeds[0] needs name and url",
    );
  });
});
