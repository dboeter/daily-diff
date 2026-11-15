/**
 * Replays the LLM prompts a daily run captured (`LLM_CAPTURE_DIR`, uploaded by the daily workflow
 * as the `llm-prompts-<run id>` artifact) on a candidate model, then has a judge model compare the
 * production answer with the candidate's, blind and in random order: the claims each answer makes
 * that its prompt does not support, and which answer a reader is better served by.
 *
 * Usage:
 *   gh run list -w daily-digest.yml -L 7 --json databaseId,createdAt
 *   gh run download <run id> -p 'llm-prompts-*' -D .scratch/model-compare/captures   # per run
 *   node --env-file=.env --import tsx scripts/model-compare.ts .scratch/model-compare/captures/llm-prompts-* [--dry-run]
 *
 * Options: --candidate <id> (default anthropic/claude-sonnet-5.5), --judge <id> (default
 * anthropic/claude-opus-5.5), --out <dir> (default .scratch/model-compare), --dry-run (count calls
 * and estimate tokens only). Needs OPENROUTER_API_KEY. Each answer is cached under <out>/cache, so a
 * rerun resumes; the summary goes to <out>/results.md and every judged claim to <out>/claims.jsonl.
 */

import fs from "node:fs";
import path from "node:path";
import { OpenRouterProvider } from "../src/providers/openrouter.ts";

interface Captured {
  label: string;
  maxTokens: number;
  prompt: string;
  output: string;
}

interface Claim {
  quote: string;
  why: string;
}

interface Verdict {
  production: Claim[];
  candidate: Claim[];
  better: "production" | "candidate" | "tie";
  reason: string;
}

const args = process.argv.slice(2);
function option(name: string, fallback: string): string {
  const i = args.indexOf(name);
  return (i >= 0 ? args[i + 1] : undefined) ?? fallback;
}
const CANDIDATE = option("--candidate", "anthropic/claude-sonnet-5.5");
const JUDGE = option("--judge", "anthropic/claude-opus-5.5");
const OUT = option("--out", ".scratch/model-compare");
const DRY_RUN = args.includes("--dry-run");
const optionValues = new Set(["--candidate", "--judge", "--out"].map((o) => option(o, "")));
const captureDirs = args.filter((a) => !a.startsWith("--") && !optionValues.has(a));

// The production settings (low effort, free fallbacks) belong to the free model, not to these two.
delete process.env["OPENROUTER_REASONING_EFFORT"];
delete process.env["OPENROUTER_FALLBACK_MODELS"];

const JUDGE_PROMPT = (prompt: string, a: string, b: string) => `You check the writing of a daily news digest.
Below is the exact prompt a writing model received, then two answers to it, A and B, from different models.

Task 1. For each answer, list every claim that the prompt's data does not support: a fact, number, date,
status or stage that is not in the data; a qualifier dropped ("internal benchmarks", "the default model");
a claim made stronger than the source ("recommends" written as "must", "upcoming" as "released", one
reporter written as "users report"); a user's allegation stated as fact. Quote the answer's words exactly.
Do not list style problems, and do not list a claim the data supports.

Task 2. Say which answer serves the digest's reader better, following the prompt's own instructions
(format, length, what to pick), or "tie".

Reply with JSON only:
{"A": [{"quote": "...", "why": "..."}], "B": [...], "better": "A" | "B" | "tie", "reason": "one sentence"}

=== PROMPT ===
${prompt}

=== ANSWER A ===
${a}

=== ANSWER B ===
${b}`;

function parseJson<T>(raw: string): T {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error(`no JSON object in: ${raw.slice(0, 200)}`);
  return JSON.parse(raw.slice(start, end + 1)) as T;
}

async function withRetries<T>(what: string, fn: () => Promise<T>): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= 3) throw err;
      console.error(`[compare] ${what} failed (${String(err).slice(0, 160)}), retry ${attempt}`);
      await new Promise((r) => setTimeout(r, 5000 * attempt));
    }
  }
}

/** Reads `<cache>/<key>.json` or computes and writes it, so a rerun spends nothing on what is done. */
async function cached<T>(file: string, compute: () => Promise<T>): Promise<T> {
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  const value = await compute();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
  return value;
}

async function pool<T>(items: T[], size: number, run: (item: T) => Promise<void>): Promise<void> {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: size }, async () => {
      for (let item = queue.shift(); item; item = queue.shift()) await run(item);
    }),
  );
}

async function main() {
  if (captureDirs.length === 0) throw new Error("give at least one capture folder");
  const calls = captureDirs.flatMap((dir) =>
    fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .sort()
      .map((f) => ({
        day: path.basename(dir),
        file: f,
        ...(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Captured),
      })),
  );
  const promptTokens = calls.reduce((n, c) => n + c.prompt.length / 4, 0);
  console.log(
    `${calls.length} calls in ${captureDirs.length} runs, about ${Math.round(promptTokens / 1000)}k prompt tokens ` +
      `(the judge reads each prompt again, plus both answers)`,
  );
  if (DRY_RUN) return;

  const candidate = new OpenRouterProvider({ model: CANDIDATE });
  const judge = new OpenRouterProvider({ model: JUDGE });
  const cacheDir = path.join(OUT, "cache", CANDIDATE.replace(/\W+/g, "_"));
  const rows: Array<{ day: string; file: string; label: string; verdict: Verdict }> = [];
  const failures: string[] = [];

  await pool(calls, 3, async (call) => {
    const key = path.join(cacheDir, call.day, call.file);
    try {
      const answer = await cached(key.replace(/\.json$/, ".answer.json"), () =>
        withRetries(`${call.file} answer`, () => candidate.call(call.prompt, call.maxTokens)),
      );
      const verdict = await cached(key.replace(/\.json$/, ".verdict.json"), async () => {
        // Random order per call, so a judge's preference for the first answer averages out.
        const productionFirst = Math.random() < 0.5;
        const [a, b] = productionFirst ? [call.output, answer] : [answer, call.output];
        const raw = await withRetries(`${call.file} judge`, () =>
          judge.call(JUDGE_PROMPT(call.prompt, a, b), 8192),
        );
        const v = parseJson<{ A: Claim[]; B: Claim[]; better: "A" | "B" | "tie"; reason: string }>(raw);
        const pick = (x: "A" | "B") => ((x === "A") === productionFirst ? "production" : "candidate");
        return {
          production: productionFirst ? v.A : v.B,
          candidate: productionFirst ? v.B : v.A,
          better: v.better === "tie" ? "tie" : pick(v.better),
          reason: v.reason,
        } satisfies Verdict;
      });
      rows.push({ day: call.day, file: call.file, label: call.label, verdict });
      console.log(
        `[compare] ${call.day}/${call.file}: ${verdict.production.length} vs ${verdict.candidate.length}, ${verdict.better}`,
      );
    } catch (err) {
      failures.push(`${call.day}/${call.file}: ${String(err).slice(0, 200)}`);
    }
  });

  rows.sort((x, y) => (x.day + x.file).localeCompare(y.day + y.file));
  fs.writeFileSync(
    path.join(OUT, "claims.jsonl"),
    rows
      .flatMap((r) =>
        (["production", "candidate"] as const).flatMap((side) =>
          r.verdict[side].map((c) =>
            JSON.stringify({ day: r.day, file: r.file, label: r.label, side, ...c }),
          ),
        ),
      )
      .join("\n") + "\n",
  );

  // One row per call site: unsupported claims on each side and the judge's preference.
  const sites = new Map<
    string,
    { n: number; prod: number; cand: number; prodBetter: number; candBetter: number; tie: number }
  >();
  for (const r of rows) {
    const site = r.label.replace(/[:#].*/, "");
    const s = sites.get(site) ?? { n: 0, prod: 0, cand: 0, prodBetter: 0, candBetter: 0, tie: 0 };
    s.n++;
    s.prod += r.verdict.production.length;
    s.cand += r.verdict.candidate.length;
    if (r.verdict.better === "production") s.prodBetter++;
    else if (r.verdict.better === "candidate") s.candBetter++;
    else s.tie++;
    sites.set(site, s);
  }
  const total = [...sites.values()].reduce(
    (t, s) => ({
      n: t.n + s.n,
      prod: t.prod + s.prod,
      cand: t.cand + s.cand,
      prodBetter: t.prodBetter + s.prodBetter,
      candBetter: t.candBetter + s.candBetter,
      tie: t.tie + s.tie,
    }),
    { n: 0, prod: 0, cand: 0, prodBetter: 0, candBetter: 0, tie: 0 },
  );
  const line = (name: string, s: typeof total) =>
    `| ${name} | ${s.n} | ${s.prod} | ${s.cand} | ${s.prodBetter} | ${s.candBetter} | ${s.tie} |`;
  const md = [
    `# Model comparison: production vs ${CANDIDATE}`,
    "",
    `Judge: ${JUDGE}, blind, answers in random order. Runs: ${captureDirs.map((d) => path.basename(d)).join(", ")}.`,
    "Unsupported = claims the judge found that the prompt's data does not support. Every claim is in `claims.jsonl`.",
    "",
    "| Call site | Calls | Unsupported (production) | Unsupported (candidate) | Production better | Candidate better | Tie |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...[...sites.entries()].sort().map(([k, s]) => line(k, s)),
    line("**All**", total),
    "",
    ...(failures.length ? ["## Failed calls", "", ...failures.map((f) => `- ${f}`), ""] : []),
  ].join("\n");
  fs.writeFileSync(path.join(OUT, "results.md"), md);
  console.log(md);
  if (failures.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
