/**
 * Weekly Diff experiment: one article on the week, written by a strong model, then checked
 * sentence by sentence against the week's source texts.
 * Everything goes under `.scratch/weekly-diff/<date>/`, nothing under `digests/`.
 *
 *   node --env-file=.env --import tsx .scratch/weekly-diff/article.ts [YYYY-MM-DD]
 *
 * The writer's source and prompt are the pipeline's own (`buildWeekSource` in
 * `src/weekly/source.ts`, `buildWeeklyArticlePrompt`), so the lab measures what the weekly run
 * sends. GitHub objects come through `gh api`, cached in `github-cache.json`. The source is
 * saved as `source-raw2.md` and reused, so every run has the same input, and the judge checks
 * each article against it. Until 2026-11-16 the lab also had a source made of the pages' own
 * rows (`source.md`, the `-digest` and `v1`/`v2` files): an article written from it repeated a
 * row summary's error, so the pipeline never used it.
 *
 * Options: --model <id> (default claude-opus-5-5), --effort low|medium|high|xhigh|max (default low),
 * --run <n> (a repeat: `-r<n>` in the file names), --judge <id> (default claude-opus-5-5, at
 * high effort; `codex` asks the Codex CLI, and any other judge's name goes in its file names), --article <file> (judge an existing article, write none), --no-check (skip
 * the judge), --refresh (rebuild the source files; else saved ones are reused, so every run
 * has the same input), --source-only (stop after the source and prompt files, no API call),
 * --codex-model <id> and --codex-effort <level> (for `--judge codex`).
 * An article is written again when its prompt changed.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { toCstDateStr } from "../../src/core/date.ts";
import type { Candidate } from "../../src/reports/candidates.ts";
import { buildWeeklyArticlePrompt, WEEK_SOURCE_NOTE } from "../../src/reports/prompts-pages.ts";
import { buildWeekSource, WEEK_PAGE_IDS, type GitHubFetch } from "../../src/weekly/source.ts";
import { loadWeek } from "../../src/weekly/week.ts";

type Effort = "low" | "medium" | "high" | "xhigh" | "max";

const args = process.argv.slice(2);
const option = (name: string, fallback: string): string => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : (args[i + 1] ?? fallback);
};
const DATE = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a)) ?? toCstDateStr(new Date());
const MODEL = option("--model", "claude-opus-5-5");
const EFFORT = option("--effort", "low") as Effort;
const JUDGE = option("--judge", "claude-opus-5-5");
const JUDGE_EFFORT: Effort = "high";
/** `--judge codex` asks the Codex CLI (its configured model and effort) instead of the Anthropic API. */
const CODEX = JUDGE === "codex";
/** `--codex-model <id>` and `--codex-effort <level>`: unset, Codex uses its own configuration. */
const CODEX_MODEL = option("--codex-model", "");
const CODEX_EFFORT = option("--codex-effort", "");
/** In the judge and check file names for every judge but the default, so two judges never share a file. */
const JUDGE_TAG =
  JUDGE === "claude-opus-5-5"
    ? ""
    : `-${[JUDGE, ...(CODEX ? [CODEX_MODEL, CODEX_EFFORT] : [])]
        .filter(Boolean)
        .join("_")
        .replace(/\W+/g, "_")}`;
const RUN = option("--run", "");
const ARTICLE = option("--article", "");
const OUT = path.join(".scratch", "weekly-diff", DATE);
/** The writer's source and the judge's reference. The 2 is its build: raise it when `buildWeekSource` changes. */
const RAW_FILE = path.join(OUT, "source-raw2.md");
const GITHUB_CACHE = path.join(OUT, "github-cache.json");
const USAGE_LOG = path.join(OUT, "usage.jsonl");
// Thinking counts against it. The models' own cap: Haiku at xhigh effort spent 100,000 tokens on reasoning alone.
const ARTICLE_TOKENS = 128000;
const JUDGE_TOKENS = 100000;
/** In the article file names; raise it with each change to the article prompt, so runs stay comparable. */
const PROMPT_VERSION = "v3";
/** In the check file names; raise it with each change to the judge prompt: counts of two rubrics do not mix. */
const JUDGE_VERSION = "j2";
/** Supported verdicts listed in the check file for a reading by hand. */
const SAMPLE_SIZE = 8;

const githubCache: Record<string, unknown> = fs.existsSync(GITHUB_CACHE)
  ? (JSON.parse(fs.readFileSync(GITHUB_CACHE, "utf8")) as Record<string, unknown>)
  : {};

/** A GitHub API object through `gh` (the repo's `.env` has no token), cached; undefined when the call fails. */
const github: GitHubFetch = (apiPath) => {
  if (!(apiPath in githubCache)) {
    try {
      githubCache[apiPath] = JSON.parse(execFileSync("gh", ["api", apiPath], { encoding: "utf8" }));
      fs.writeFileSync(GITHUB_CACHE, JSON.stringify(githubCache));
    } catch (err) {
      console.error(`  gh api ${apiPath} failed: ${String(err).split("\n")[0]}`);
      return Promise.resolve(undefined);
    }
  }
  return Promise.resolve(githubCache[apiPath]);
};

/** The week's source as the pipeline builds it (`src/weekly/`), from the saved days. */
async function buildSource(): Promise<string> {
  const day = (name: string) => path.join("digests", DATE, name);
  const pages: Record<string, string> = {};
  for (const id of WEEK_PAGE_IDS) {
    if (fs.existsSync(day(`${id}.md`))) pages[id] = fs.readFileSync(day(`${id}.md`), "utf8");
  }
  const candidates = JSON.parse(fs.readFileSync(day("candidates.json"), "utf8")) as Candidate[];
  const week = loadWeek({ date: DATE, candidates, pages });
  const source = await buildWeekSource(week.days, week.vendorNotes, github);
  console.error(`  source: ${source.items} items`);
  return source.text;
}

const judgePrompt = (reference: string, article: string): [string, string] => [
  `You check an article against a reference: the source texts of the items it may report. The writer was told to state facts only from its source and to set every sentence of interpretation in italics. The writer may have seen another rendering of these items, such as a summary. Judge only against this reference.

The reference lists the items a digest showed in one week. ${WEEK_SOURCE_NOTE} The "digest:" lines, the Trends tables and the AI Policy dates count as source like the texts.

Go through the article sentence by sentence, headings excluded, in order. For each sentence print one JSON object on its own line, and nothing else:

{"n": 1, "start": "the sentence's first six words, copied exactly", "kind": "fact" | "interpretation" | "mixed", "italic": true | false, "verdict": "supported" | "partly" | "unsupported" | "unverifiable", "severity": "none" | "minor" | "major", "problem": "what is wrong, or empty", "source": "a quote copied exactly from the reference that the sentence rests on or that contradicts it, or empty"}

Kind:
- "fact" reports something. "interpretation" gives the writer's reading: meaning, connection, cause, outlook, advice. "mixed" reports a new fact and gives a reading in one sentence.
- A sentence that restates a fact of its own section as the premise of a reading is "interpretation", not "mixed". Judge the restated fact as a premise.
- "italic" is whether the article sets the sentence in italics.

Verdict:
- A fact is "supported" when the reference states all of it: each figure with its unit and window, each date, name, count, qualifier and attribution, at the same strength. A date given in another format is the same date.
- A comparison, count or date difference that the writer worked out from several rows is "supported" when it is correct. Work it out yourself. Flag it only when it is wrong.
- A fact is "partly" when the sentence adds to the reference, strengthens it, merges separate items, or drops an attribution or qualifier. It is "unsupported" when the reference does not say it or says otherwise.
- A fact is "unverifiable" when it concerns an item whose text ends with "[…cut]" or has no text, and the missing part could hold it.
- An interpretation is "supported" when every fact it relies on is in the reference and it is worded as a reading no stronger than those facts. It is "partly" when it claims more than they carry: a lasting trend from one week, a cause the reference does not give, certainty about the future. It is "unsupported" when it relies on a fact the reference does not have or contradicts.
- For "mixed", judge the factual part by the fact rules and name the unmarked reading in "problem".

Severity:
- "none" for "supported".
- "major" when the sentence would mislead a reader about what happened, who says it, when, how many or how certain it is: a wrong figure, count, date or name, a report or claim stated as established fact, a cause or link the reference does not give, separate items merged, a reading built on a wrong or missing fact.
- "minor" for every other flag: a dropped qualifier or scope that leaves the statement true, loose wording, a reading worded a little too strongly.

REFERENCE

${reference}`,
  `

ARTICLE

${article}`,
];

// ---------------------------------------------------------------------------
// Calls and checks
// ---------------------------------------------------------------------------

/**
 * One call. `blocks` are the prompt's parts in order; the first is cached for an hour, so
 * calls that share it (the writer's whole prompt, the judge's rules and reference) read it
 * at the cache price. Every call's token counts go to `usage.jsonl`.
 */
async function ask(
  client: Anthropic,
  model: string,
  blocks: string[],
  maxTokens: number,
  effort: Effort,
  label: string,
): Promise<string> {
  // Streamed: the SDK refuses a plain request whose max_tokens could run past 10 minutes.
  const started = Date.now();
  const message = await client.messages
    .stream({
      model,
      max_tokens: maxTokens,
      messages: [
        {
          role: "user",
          content: blocks.map((text, i) => ({
            type: "text" as const,
            text,
            ...(i === 0 ? { cache_control: { type: "ephemeral" as const, ttl: "1h" as const } } : {}),
          })),
        },
      ],
      // The SDK's type lacks "xhigh", which the models endpoint lists.
      output_config: { effort: effort as "high" },
    })
    .finalMessage();
  const text = message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  const usage = {
    label,
    model,
    effort,
    input: message.usage.input_tokens,
    cache_write: message.usage.cache_creation_input_tokens ?? 0,
    cache_read: message.usage.cache_read_input_tokens ?? 0,
    output: message.usage.output_tokens,
    thinking_blocks: message.content.filter((b) => b.type === "thinking" || b.type === "redacted_thinking")
      .length,
    answer_chars: text.length,
    stop: message.stop_reason,
    seconds: Math.round((Date.now() - started) / 1000),
  };
  fs.appendFileSync(USAGE_LOG, JSON.stringify(usage) + "\n");
  console.error(`  ${JSON.stringify(usage)}`);
  if (message.stop_reason === "max_tokens") {
    // Keep what the model reasoned, to tell a long deliberation from a loop.
    const reasoning = message.content.flatMap((b) => (b.type === "thinking" ? [b.thinking] : [])).join("\n");
    fs.writeFileSync(
      path.join(OUT, `cut-${label.replace(/\W+/g, "_")}.txt`),
      `${reasoning}\n\n---\n\n${text}`,
    );
  }
  if (message.stop_reason === "max_tokens") throw new Error(`${model}: answer cut at ${maxTokens} tokens`);
  if (!text) throw new Error(`${model}: empty answer`);
  return text;
}

/**
 * The same judge prompt through the Codex CLI, as a second, independent judge. It runs in an
 * empty folder, read-only, with the prompt on stdin, so it sees neither the repo nor the
 * other judge's verdicts.
 */
function askCodex(prompt: string, label: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "weekly-diff-codex-"));
  const answerFile = path.join(dir, "answer.txt");
  const started = Date.now();
  execFileSync(
    "codex",
    [
      "exec",
      "-",
      "--sandbox",
      "read-only",
      "--skip-git-repo-check",
      "--ephemeral",
      "-C",
      dir,
      "-o",
      answerFile,
      ...(CODEX_MODEL ? ["-m", CODEX_MODEL] : []),
      ...(CODEX_EFFORT ? ["-c", `model_reasoning_effort="${CODEX_EFFORT}"`] : []),
    ],
    {
      input: `${prompt}\n\nEverything you need is above. Run no command and read no file. Print only the JSON lines.`,
      stdio: ["pipe", "ignore", "inherit"],
      timeout: 40 * 60 * 1000,
      maxBuffer: 64 * 1024 * 1024,
    },
  );
  const text = fs.existsSync(answerFile) ? fs.readFileSync(answerFile, "utf8") : "";
  fs.appendFileSync(
    USAGE_LOG,
    JSON.stringify({
      label,
      model: `codex ${CODEX_MODEL} ${CODEX_EFFORT}`.trim(),
      answer_chars: text.length,
      seconds: Math.round((Date.now() - started) / 1000),
    }) + "\n",
  );
  if (!text.trim()) throw new Error("codex: empty answer");
  return text;
}

const withoutUrls = (text: string): string => text.replace(/\]\([^)]*\)/g, "]");
const oneSpace = (text: string): string => text.replace(/\s+/g, " ").trim();

/** Links and figures in the article that the reference does not contain. A floor only: a figure found anywhere passes. */
function codeChecks(reference: string, article: string): { links: string[]; figures: string[] } {
  const links = [...article.matchAll(/\]\((https?:[^)\s]+)\)/g)]
    .map((m) => m[1]!)
    .filter((url) => !reference.includes(url));
  const referenceText = withoutUrls(reference);
  const figures = [
    ...withoutUrls(article).matchAll(/[+−-]?\d[\d.,]*\d(?:\.\d+)?[TMBKk%×x]?|[+−-]?\d[TMBKk%×x]/g),
  ]
    .map((m) => m[0].replace(/[.,]$/, ""))
    .filter((figure) => !referenceText.includes(figure));
  return { links: [...new Set(links)], figures: [...new Set(figures)] };
}

interface Verdict {
  n: number;
  start: string;
  kind: string;
  italic: boolean;
  verdict: string;
  severity: string;
  problem: string;
  source: string;
}

function parseVerdicts(text: string): Verdict[] {
  return text.split("\n").flatMap((line) => {
    const json = /\{.*\}/.exec(line)?.[0];
    if (!json) return [];
    try {
      return [JSON.parse(json) as Verdict];
    } catch {
      console.error(`  unparsed judge line: ${line.slice(0, 120)}`);
      return [];
    }
  });
}

/** The article's sentences as code counts them, headings excluded: a rough count to hold the judge's against. */
function sentenceCount(article: string): number {
  return withoutUrls(article)
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#"))
    .flatMap((line) => line.split(/(?<=[.!?]["”’)*\]`]*)(?<!\bArt\.)\s+(?=["“*[(`A-Za-z0-9])/))
    .filter((sentence) => /[a-z]/i.test(sentence)).length;
}

/** Text as the judge quotes a sentence's start: without link brackets, emphasis, backticks and quote marks. */
const plain = (text: string): string => oneSpace(text.replace(/[[\]*`"“”]/g, "")).toLowerCase();

/** A deterministic pick, so a rerun of the report lists the same sample. */
function seededSample<T>(items: T[], size: number, seed: string): T[] {
  let state = [...seed].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) | 0, 7);
  const random = () => {
    state = (Math.imul(state ^ (state >>> 15), 0x2c1b3c6d) + 0x9e3779b9) | 0;
    return ((state ^ (state >>> 13)) >>> 0) / 2 ** 32;
  };
  const pool = [...items];
  const picked: T[] = [];
  while (pool.length && picked.length < size)
    picked.push(pool.splice(Math.floor(random() * pool.length), 1)[0]!);
  return picked;
}

function checkReport(
  name: string,
  verdicts: Verdict[],
  checks: { links: string[]; figures: string[] },
  article: string,
  reference: string,
): string {
  const count = (test: (v: Verdict) => boolean) => verdicts.filter(test).length;
  const verdictKinds = ["supported", "partly", "unsupported", "unverifiable"];
  const table = ["fact", "mixed", "interpretation"].map(
    (kind) =>
      `| ${kind} | ${count((v) => v.kind === kind)} | ${verdictKinds.map((verdict) => count((v) => v.kind === kind && v.verdict === verdict)).join(" | ")} | ${count((v) => v.kind === kind && v.severity === "major")} | ${count((v) => v.kind === kind && v.severity === "minor")} |`,
  );
  const flagged = verdicts.filter(
    (v) => v.verdict !== "supported" || (v.kind === "interpretation") !== v.italic,
  );
  // The judge's own work, checked by code: did it cover the article, and are its quotes in the reference?
  const articleText = plain(withoutUrls(article));
  const startsFound = count((v) => articleText.includes(plain(v.start.replace(/…$/, ""))));
  const quoted = verdicts.filter((v) => v.source);
  const referenceText = oneSpace(reference);
  const quotesFound = quoted.filter((v) => referenceText.includes(oneSpace(v.source))).length;
  const sample = seededSample(
    verdicts.filter((v) => v.verdict === "supported"),
    SAMPLE_SIZE,
    name,
  ).sort((a, b) => a.n - b.n);
  const line = (v: Verdict) =>
    `- ${v.n}. "${v.start} …" (${v.kind}${v.italic ? ", italic" : ""}; ${v.verdict}${v.severity && v.severity !== "none" ? `, ${v.severity}` : ""}): ${v.problem || "—"}${v.source ? ` Source: "${v.source}"` : ""}`;
  return [
    `# Check of ${name} for ${DATE}`,
    "",
    `Judge: ${CODEX ? `Codex CLI (${CODEX_MODEL || "its configured model"}, ${CODEX_EFFORT || "its configured"} effort)` : `${JUDGE} at ${JUDGE_EFFORT} effort`}, rubric ${JUDGE_VERSION}, against ${path.basename(RAW_FILE)}.`,
    "",
    `Flags: ${count((v) => v.severity === "major")} major, ${count((v) => v.severity === "minor")} minor. Unmarked interpretation: ${count((v) => v.kind !== "fact" && !v.italic)}. Italic fact: ${count((v) => v.kind === "fact" && v.italic)}.`,
    "",
    "| Kind | Sentences | Supported | Partly | Unsupported | Unverifiable | Major | Minor |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...table,
    "",
    "## The judge's coverage",
    "",
    `- Sentences: the judge gave ${verdicts.length} verdicts; code counts ${sentenceCount(article)} sentences.`,
    `- Sentence starts found in the article: ${startsFound} of ${verdicts.length}.`,
    `- Quotes found word for word in the reference: ${quotesFound} of ${quoted.length}.`,
    `- Links not in the reference (${checks.links.length}): ${checks.links.join(", ") || "none"}`,
    `- Figures not in the reference as written (${checks.figures.length}): ${checks.figures.join(", ") || "none"}`,
    "",
    "## Flagged sentences",
    "",
    ...flagged.map(line),
    "",
    `## Supported sentences to read by hand (seeded sample of ${sample.length})`,
    "",
    ...sample.map(line),
    "",
  ].join("\n");
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT, { recursive: true });
  const refresh = args.includes("--refresh");
  if (refresh || !fs.existsSync(RAW_FILE)) fs.writeFileSync(RAW_FILE, await buildSource());
  const reference = fs.readFileSync(RAW_FILE, "utf8");
  console.error(`reference: ${reference.length} chars (${RAW_FILE})`);

  const client = new Anthropic();
  let articleFile = ARTICLE;
  let rewritten = false;
  if (!ARTICLE) {
    const prompt = buildWeeklyArticlePrompt(reference, DATE);
    const tag = "raw2";
    fs.writeFileSync(path.join(OUT, `prompt-${PROMPT_VERSION}-${tag}.txt`), prompt);
    if (args.includes("--source-only")) return;

    const name = `${MODEL.replace(/\W+/g, "_")}-${EFFORT}-${PROMPT_VERSION}-${tag}${RUN ? `-r${RUN}` : ""}`;
    articleFile = path.join(OUT, `article-${name}.md`);
    // An article is reused only for the prompt it was written from: a changed prompt or
    // source would otherwise re-judge the old article.
    const promptFile = path.join(OUT, `prompt-${name}.txt`);
    const written = fs.existsSync(promptFile) ? fs.readFileSync(promptFile, "utf8") : undefined;
    if (!fs.existsSync(articleFile) || written !== prompt) {
      fs.writeFileSync(
        articleFile,
        (await ask(client, MODEL, [prompt], ARTICLE_TOKENS, EFFORT, `write ${name}`)).trim() + "\n",
      );
      fs.writeFileSync(promptFile, prompt);
      rewritten = true;
    }
  } else if (args.includes("--source-only")) return;

  const article = fs.readFileSync(articleFile, "utf8");
  const name = path.basename(articleFile, ".md").replace(/^article-/, "");
  console.error(`article: ${article.split(/\s+/).length} words (${articleFile})`);
  if (args.includes("--no-check")) return;

  const judgeFile = path.join(OUT, `judge-${name}-${JUDGE_VERSION}${JUDGE_TAG}.jsonl`);
  // A saved judgement holds only for the article and the reference it was made from.
  if (!fs.existsSync(judgeFile) || refresh || rewritten) {
    const blocks = judgePrompt(reference, article);
    const raw = CODEX
      ? askCodex(blocks.join(""), `judge ${name} (codex)`)
      : await ask(client, JUDGE, blocks, JUDGE_TOKENS, JUDGE_EFFORT, `judge ${name}`);
    fs.writeFileSync(judgeFile, raw.trim() + "\n");
  }
  const verdicts = parseVerdicts(fs.readFileSync(judgeFile, "utf8"));
  const report = checkReport(name, verdicts, codeChecks(reference, article), article, reference);
  fs.writeFileSync(path.join(OUT, `check-${name}-${JUDGE_VERSION}${JUDGE_TAG}.md`), report);
  console.log(report);
}

await main();
