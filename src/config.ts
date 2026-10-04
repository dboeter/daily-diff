/**
 * Loads and validates Daily Diff configuration from config.yml.
 * Falls back to built-in defaults if the file is missing or a section is absent.
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

interface RawConfig {
  agents?: RawRepoEntry[];
  skills_repo?: string;
  infra_repos?: RawRepoEntry[];
}

export interface RadarConfig {
  agents: RepoConfig[];
  skillsRepo: string;
  infraRepos: RepoConfig[];
}

// ---------------------------------------------------------------------------
// Defaults (mirrors config.yml)
// ---------------------------------------------------------------------------

// Coding agents and personal AI assistants, CLI or not. Keywords are the terms
// matchAgentNews looks for in HN/web/trending items; without them it uses the
// display name and repo name. Pi needs explicit keywords: "pi" alone matches
// Raspberry Pi and every other use of the word.
const DEFAULT_AGENTS: RepoConfig[] = [
  { id: "claude-code", repo: "anthropics/claude-code", name: "Claude Code" },
  { id: "codex", repo: "openai/codex", name: "OpenAI Codex", keywords: ["codex"] },
  { id: "gemini-cli", repo: "google-gemini/gemini-cli", name: "Gemini CLI" },
  { id: "copilot-cli", repo: "github/copilot-cli", name: "GitHub Copilot CLI", keywords: ["copilot cli"] },
  { id: "opencode", repo: "anomalyco/opencode", name: "OpenCode" },
  {
    id: "pi",
    repo: "earendil-works/pi",
    name: "Pi",
    keywords: ["pi coding agent", "pi agent", "earendil"],
  },
  { id: "qwen-code", repo: "QwenLM/qwen-code", name: "Qwen Code" },
  { id: "openclaw", repo: "openclaw/openclaw", name: "OpenClaw" },
  { id: "hermes-agent", repo: "nousresearch/hermes-agent", name: "Hermes Agent" },
  { id: "ironclaw", repo: "nearai/ironclaw", name: "IronClaw" },
  { id: "qwenpaw", repo: "agentscope-ai/QwenPaw", name: "QwenPaw" },
  { id: "zeroclaw", repo: "zeroclaw-labs/zeroclaw", name: "ZeroClaw" },
];

const DEFAULT_SKILLS_REPO = "anthropics/skills";

// Inference engines, gateways and fine-tuning frameworks — the layer the
// agents run on top of. Reported weekly.
const DEFAULT_INFRA_REPOS: RepoConfig[] = [
  { id: "vllm", repo: "vllm-project/vllm", name: "vLLM" },
  { id: "sglang", repo: "sgl-project/sglang", name: "SGLang" },
  { id: "llama-cpp", repo: "ggml-org/llama.cpp", name: "llama.cpp" },
  { id: "ollama", repo: "ollama/ollama", name: "Ollama" },
  { id: "litellm", repo: "BerriAI/litellm", name: "LiteLLM" },
  { id: "unsloth", repo: "unslothai/unsloth", name: "Unsloth" },
];

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

export function loadConfig(configPath = "config.yml"): RadarConfig {
  const resolved = path.resolve(configPath);

  if (!fs.existsSync(resolved)) {
    console.log(`[config] ${configPath} not found — using built-in defaults.`);
    return { agents: DEFAULT_AGENTS, skillsRepo: DEFAULT_SKILLS_REPO, infraRepos: DEFAULT_INFRA_REPOS };
  }

  const raw = yaml.load(fs.readFileSync(resolved, "utf-8")) as RawConfig;

  const agents =
    Array.isArray(raw?.agents) && raw.agents.length > 0 ? raw.agents.map(toRepoConfig) : DEFAULT_AGENTS;

  const skillsRepo =
    typeof raw?.skills_repo === "string" && raw.skills_repo.trim()
      ? raw.skills_repo.trim()
      : DEFAULT_SKILLS_REPO;

  const infraRepos =
    Array.isArray(raw?.infra_repos) && raw.infra_repos.length > 0
      ? raw.infra_repos.map(toRepoConfig)
      : DEFAULT_INFRA_REPOS;

  console.log(
    `[config] Loaded from ${configPath}: ` + `${agents.length} agents, ${infraRepos.length} infra repos`,
  );

  return { agents, skillsRepo, infraRepos };
}
