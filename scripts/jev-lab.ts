/**
 * Jev lab for Policy Watch: replays question variants over a fixed pool of
 * items, so changes to the questions, state or weights can be compared (and
 * labelled) without touching a daily run. Writes only to .scratch/ai-policy/lab/.
 *
 * Usage (TYPESAFE_API_KEY; USA_GOV_API_KEY and PLURAL_API_KEY for the US sources):
 *   node --env-file=.env --import tsx scripts/jev-lab.ts fetch
 *   node --import tsx scripts/jev-lab.ts enrich
 *   node --env-file=.env --import tsx scripts/jev-lab.ts run [variant…] [--repeat N]
 *   node --import tsx scripts/jev-lab.ts report
 *
 * fetch:  every current item of every source, as a first run sees them (no state): pool.json.
 * enrich: the full text behind each pool item's link (jev-lab-text.ts): bodies.json, for the
 *         `full_text` variants. Items already fetched are skipped; a failed fetch is retried.
 * run:    asks Jev each variant's questions for every pool item not yet answered in
 *         runs/<variant>.r<k>.json. Default: every variant, baseline twice (noise), others once.
 * report: report.md (keep counts, flips and rank correlation against the baseline, noise)
 *         and labels.md: mark `[k]` keep or `[d]` drop; later reports score each variant on them.
 */

import fs from "node:fs";
import path from "node:path";
import { loadConfig } from "../src/config.ts";
import { toCstDateStr } from "../src/date.ts";
import { askJev, mapJev } from "../src/jev.ts";
import { fetchPolicySources, type PolicyItem } from "../src/policy.ts";
import { newItems } from "../src/report-state.ts";
import {
  loadPolicyVerdicts,
  policyRelevance,
  policyRequest,
  watchlisted,
  watchlistFor,
  type PolicyAnswers,
} from "../src/policy-jev.ts";
import { fullText } from "./jev-lab-text.ts";

const LAB_DIR = path.join(".scratch", "ai-policy", "lab");
const POOL_FILE = path.join(LAB_DIR, "pool.json");
const RUNS_DIR = path.join(LAB_DIR, "runs");
const REPORT_FILE = path.join(LAB_DIR, "report.md");
const LABELS_FILE = path.join(LAB_DIR, "labels.md");
const BODIES_FILE = path.join(LAB_DIR, "bodies.json");

const CONFIG = loadConfig().policy;

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

type Request = ReturnType<typeof policyRequest>;
type Raw = Record<string, { noul?: number; score?: number }>;

interface Variant {
  name: string;
  note: string;
  request: (item: PolicyItem) => Request;
  /** Raw answers → the production shape, so policyRelevance decides as it would in a run. */
  toAnswers?: (raw: Raw) => PolicyAnswers;
}

const baseline = (item: PolicyItem): Request => policyRequest(item, CONFIG.readerProfile);
const clone = <T>(x: T): T => structuredClone(x);
type Question = { instructions: string; criteria: unknown; type: string };

/** The baseline with `patch` applied to a deep copy of its questions. */
const patchQuestions =
  (patch: (q: Record<string, Question>, item: PolicyItem) => void) =>
  (item: PolicyItem): Request => {
    const { state, questions } = baseline(item);
    const q = clone(questions) as Record<string, Question>;
    patch(q, item);
    return { state, questions: q };
  };

const JURISDICTION_NAMES: Record<string, string> = {
  eu: "European Union",
  nl: "the Netherlands",
  us_federal: "United States (federal)",
  us_states: "a US state",
  other: "elsewhere",
};

type Bodies = Record<string, { text: string; via: string } | { error: string }>;
let bodies: Bodies | null = null;
const bodyOf = (item: PolicyItem): string | undefined => {
  bodies ??= readJson<Bodies>(BODIES_FILE, {});
  const b = bodies[keyOf(item)];
  return b && "text" in b ? b.text : undefined;
};

/**
 * The baseline plus `text`, the first `maxChars` of the item's full text (when
 * `enrich` got it), and every question told to read it. An item without one is
 * asked exactly as the baseline.
 */
const withFullText =
  (maxChars: number) =>
  (item: PolicyItem): Request => {
    const { state, questions } = baseline(item);
    const body = bodyOf(item);
    if (!body) return { state, questions };
    const q = clone(questions) as Record<string, Question>;
    for (const question of Object.values(q)) {
      question.instructions = question.instructions.replace(
        /`title` and `description`/,
        "`title`, `description` and `text` (the start of the document itself)",
      );
    }
    return { state: { ...state, text: body.slice(0, maxChars) }, questions: q };
  };

const VARIANTS: Variant[] = [
  { name: "baseline", note: "production questions and state", request: baseline },
  {
    name: "paraphrase",
    note: "same criteria, reworded instructions (sensitivity to wording)",
    request: patchQuestions((q) => {
      q["about_ai_policy"]!.instructions =
        "Is `title` and `description` an item about public policy on artificial intelligence?";
      q["binding"]!.instructions =
        "Is the measure that `title` and `description` concern (at `stage`, if present) legally binding?";
      q["new_stage"]!.instructions =
        "Do `title` and `description` (at `stage`, if present) describe a step forward in a policy process, as opposed to routine activity?";
      q["significance"]!.instructions =
        "For organisations using AI in the jurisdiction concerned, how significant is the item in `title` and `description` (at `stage`, if present)?";
    }),
  },
  {
    name: "source_ctx",
    note: "state also names the source and jurisdiction",
    request: (item) => {
      const { state, questions } = baseline(item);
      return {
        state: { ...state, source: item.source, jurisdiction: JURISDICTION_NAMES[item.jurisdiction]! },
        questions,
      };
    },
  },
  {
    name: "new_stage_tight",
    note: "new_stage criteria name parliamentary routine (questions, letters, debates) as routine",
    request: patchQuestions((q) => {
      q["new_stage"]!.criteria = {
        true: {
          what: "A decision or formal step: something was adopted, published, voted, signed, decided, entered into force, or opened for comment",
          examples: [
            "a vote in parliament",
            "a motion adopted",
            "guidelines published",
            "a consultation launched",
            "a fine imposed",
          ],
        },
        false: {
          what: "Routine activity with no decision: a meeting, speech, event, newsletter, recap, written parliamentary questions, a debate, a letter announcing future plans, or a motion merely tabled",
          examples: [
            "written questions to a minister",
            "a committee debate",
            "a letter to parliament on next steps",
            "a minister's speech",
            "a weekly roundup",
          ],
        },
      };
    }),
  },
  {
    name: "split_about",
    note: "about_ai_policy = about AI × is government policy (two nouls)",
    request: patchQuestions((q) => {
      delete q["about_ai_policy"];
      q["about_ai"] = {
        type: "noul",
        instructions:
          "Is the item described by `title` and `description` about AI, algorithms or automated decision-making?",
        criteria: {
          true: {
            what: "AI, algorithms or automated decision-making is a main subject",
            examples: ["an AI Act implementing act", "algorithm use by a tax office", "a chatbot in schools"],
          },
          false: {
            what: "AI is absent or mentioned only in passing",
            examples: [
              "a telecoms spectrum auction",
              "a cybersecurity grant",
              "a budget debate listing AI among twenty topics",
            ],
          },
        },
      };
      q["is_policy"] = {
        type: "noul",
        instructions:
          "Is the item described by `title` and `description` about government policy: legislation, regulation, official guidance, enforcement or a government decision?",
        criteria: {
          true: {
            what: "Lawmaking, regulation, guidance, enforcement or government policy",
            examples: ["a bill", "a regulator's guidance", "a fine", "a ministry's strategy"],
          },
          false: {
            what: "Research, products, business or commentary without a policy angle",
            examples: ["a research result", "a product launch", "a company's funding round"],
          },
        },
      };
    }),
    toAnswers: (raw) =>
      ({
        ...raw,
        about_ai_policy: { noul: (raw["about_ai"]?.noul ?? NaN) * (raw["is_policy"]?.noul ?? NaN) },
      }) as unknown as PolicyAnswers,
  },
  {
    name: "reader_significance",
    note: "every item sees `reader`; significance judged for the reader and their clients",
    request: (item) => {
      const { state, questions } = baseline(item);
      const q = clone(questions) as Record<string, Question>;
      q["significance"]!.instructions =
        "How significant is the item in `title` and `description` (at `stage`, when given) for `reader` and the organisations they advise, which use AI?";
      return { state: { ...state, reader: CONFIG.readerProfile }, questions: q };
    },
  },
  {
    name: "full_text",
    note: "state adds `text`: the first 2,000 characters of the document behind the link",
    request: withFullText(2000),
  },
  {
    name: "full_text_6k",
    note: "as full_text, 6,000 characters",
    request: withFullText(6000),
  },
];

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

interface Pool {
  fetched: string;
  items: PolicyItem[];
}
interface RunEntry {
  answers: Raw;
  model: string;
}
type Run = Record<string, RunEntry>;

const keyOf = (i: PolicyItem): string => `${i.id}|${i.stage ?? ""}`;
const readJson = <T>(file: string, fallback: T): T =>
  fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf-8")) as T) : fallback;
const writeJson = (file: string, data: unknown): void => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 1) + "\n", "utf-8");
};
const runFile = (variant: string, rep: number): string => path.join(RUNS_DIR, `${variant}.r${rep}.json`);
const loadPool = (): Pool => {
  if (!fs.existsSync(POOL_FILE)) throw new Error(`No ${POOL_FILE}: run \`fetch\` first`);
  return readJson<Pool>(POOL_FILE, { fetched: "", items: [] });
};

/** Drop the score legends (the questions' own criteria, repeated per answer). */
const slim = (answers: Record<string, unknown>): Raw =>
  JSON.parse(JSON.stringify(answers, (k, v: unknown) => (k === "legend" ? undefined : v))) as Raw;

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

async function fetchPool(): Promise<void> {
  const now = new Date();
  const dateStr = toCstDateStr(now);
  const results = await fetchPolicySources(CONFIG, now, dateStr, null);
  const fetched = results.flatMap((r) => r ?? []);
  // As a first run: record-only stage items are never asked in production either.
  const items = newItems(fetched, null, dateStr).filter((i) => !i.recordOnly);
  writeJson(POOL_FILE, { fetched: dateStr, items });
  const saved = loadPolicyVerdicts();
  const ids = new Set(items.map((i) => i.id));
  const recovered = saved ? Object.keys(saved.items).filter((id) => ids.has(id)).length : 0;
  console.log(
    `${items.length} items → ${POOL_FILE}; ${results.filter((r) => r === null).length} sources failed; ` +
      `${recovered}/${saved ? Object.keys(saved.items).length : 0} saved verdicts are in the pool`,
  );
}

async function enrich(): Promise<void> {
  const pool = loadPool();
  const done = readJson<Bodies>(BODIES_FILE, {});
  const todo = pool.items.filter((i) => !(done[keyOf(i)] && "text" in done[keyOf(i)]!));
  // A few at a time: these are other people's web servers.
  const queue = [...todo];
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      for (let item = queue.shift(); item; item = queue.shift()) {
        try {
          done[keyOf(item)] = await fullText(item);
        } catch (err) {
          done[keyOf(item)] = { error: String(err) };
        }
      }
    }),
  );
  writeJson(BODIES_FILE, done);
  const tally = new Map<string, [number, number]>();
  for (const i of pool.items) {
    const b = done[keyOf(i)];
    const t = tally.get(i.source) ?? [0, 0];
    t[b && "text" in b ? 0 : 1]++;
    tally.set(i.source, t);
  }
  for (const [source, [ok, failed]] of tally) console.log(`  ${source}: ${ok} fetched, ${failed} failed`);
  const errors = new Set(Object.values(done).flatMap((b) => ("error" in b ? [b.error] : [])));
  if (errors.size > 0) console.log(`Errors: ${[...errors].join("; ")}`);
}

async function run(names: string[], repeat: number | null): Promise<void> {
  const apiKey = process.env["TYPESAFE_API_KEY"];
  if (!apiKey) throw new Error("TYPESAFE_API_KEY is not set");
  const pool = loadPool();
  const variants = names.length > 0 ? VARIANTS.filter((v) => names.includes(v.name)) : VARIANTS;
  const unknown = names.filter((n) => !VARIANTS.some((v) => v.name === n));
  if (unknown.length > 0) throw new Error(`Unknown variant(s): ${unknown.join(", ")}`);
  for (const v of variants) {
    const reps = repeat ?? (v.name === "baseline" ? 2 : 1);
    for (let rep = 1; rep <= reps; rep++) {
      const file = runFile(v.name, rep);
      const done = readJson<Run>(file, {});
      const todo = pool.items.filter((i) => !done[keyOf(i)]);
      if (todo.length === 0) continue;
      const { results } = await mapJev(
        todo,
        async (item) => {
          const { state, questions } = v.request(item);
          return askJev<Record<string, unknown>>(state, questions, apiKey);
        },
        `${v.name}.r${rep}`,
      );
      todo.forEach((item, i) => {
        const r = results[i];
        if (r) done[keyOf(item)] = { answers: slim(r.answers), model: r.model };
      });
      writeJson(file, done);
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

interface Decision {
  relevance: number;
  keep: boolean;
}

function decide(v: Variant, item: PolicyItem, raw: Raw): Decision | null {
  try {
    const answers = v.toAnswers ? v.toAnswers(raw) : (raw as unknown as PolicyAnswers);
    return policyRelevance(answers, item.jurisdiction, item.news);
  } catch {
    return null;
  }
}

/** Ranks with ties averaged. */
function ranks(xs: number[]): number[] {
  const order = xs.map((x, i) => [x, i] as const).sort((a, b) => a[0] - b[0]);
  const r = new Array<number>(xs.length);
  for (let i = 0; i < order.length;) {
    let j = i;
    while (j + 1 < order.length && order[j + 1]![0] === order[i]![0]) j++;
    for (let k = i; k <= j; k++) r[order[k]![1]] = (i + j) / 2;
    i = j + 1;
  }
  return r;
}
function spearman(a: number[], b: number[]): number {
  const ra = ranks(a);
  const rb = ranks(b);
  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const ma = mean(ra);
  const mb = mean(rb);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < ra.length; i++) {
    num += (ra[i]! - ma) * (rb[i]! - mb);
    da += (ra[i]! - ma) ** 2;
    db += (rb[i]! - mb) ** 2;
  }
  return da && db ? num / Math.sqrt(da * db) : NaN;
}

const FIELDS = ["about_ai_policy", "binding", "new_stage", "significance", "impact"] as const;
/** One answer on a 0–1 scale (scores are 0–2). */
function field(answers: PolicyAnswers, f: (typeof FIELDS)[number]): number | undefined {
  const a = answers[f] as { noul?: number; score?: number } | undefined;
  if (!a) return undefined;
  return a.noul ?? (a.score !== undefined ? a.score / 2 : undefined);
}

/** `- [k] \`key\`` lines of labels.md → key → keep. */
function loadLabels(): Map<string, boolean> {
  const labels = new Map<string, boolean>();
  if (!fs.existsSync(LABELS_FILE)) return labels;
  for (const line of fs.readFileSync(LABELS_FILE, "utf-8").split("\n")) {
    const m = /^- \[([kKdD])\] `([^`]+)`/.exec(line);
    if (m) labels.set(m[2]!, m[1]!.toLowerCase() === "k");
  }
  return labels;
}

const pct = (n: number): string => `${(n * 100).toFixed(0)}%`;
const cell = (s: string): string => s.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();

function report(): void {
  const pool = loadPool();
  const labels = loadLabels();
  const onWatchlist = (i: PolicyItem): boolean =>
    !i.news && watchlisted(i, watchlistFor(CONFIG.watchlist, i.jurisdiction));

  // Every run on disk: variant → rep → key → decision.
  const runs: { v: Variant; rep: number; run: Run; d: Map<string, Decision> }[] = [];
  for (const v of VARIANTS) {
    for (let rep = 1; fs.existsSync(runFile(v.name, rep)); rep++) {
      const run = readJson<Run>(runFile(v.name, rep), {});
      const d = new Map<string, Decision>();
      for (const item of pool.items) {
        const e = run[keyOf(item)];
        const dec = e && decide(v, item, e.answers);
        if (dec) d.set(keyOf(item), dec);
      }
      runs.push({ v, rep, run, d });
    }
  }
  const base = runs.find((r) => r.v.name === "baseline" && r.rep === 1);
  if (!base) throw new Error("No baseline run: run `run baseline` first");
  // Watchlisted non-news items are kept whatever Jev says: they say nothing about a variant.
  const judged = pool.items.filter((i) => !onWatchlist(i) && base.d.has(keyOf(i)));

  const out: string[] = [];
  out.push(`# Policy Watch Jev lab`, ``);
  out.push(
    `Pool: ${pool.items.length} items fetched ${pool.fetched}; ${judged.length} judged by Jev ` +
      `(${pool.items.length - judged.length} watchlisted or unanswered). Labels: ${labels.size}.`,
    ``,
  );

  // Summary per run.
  out.push(`## Runs against baseline.r1`, ``);
  out.push(
    `| Run | Kept | Flips | Spearman | Δ about | Δ binding | Δ new_stage | Δ significance | Δ impact | Labelled acc. | Precision | Recall |`,
  );
  out.push(`|---|---|---|---|---|---|---|---|---|---|---|---|`);
  const flipsByKey = new Map<string, string[]>();
  for (const r of runs) {
    const both = judged.filter((i) => r.d.has(keyOf(i)));
    const kept = both.filter((i) => r.d.get(keyOf(i))!.keep).length;
    const flips = both.filter((i) => r.d.get(keyOf(i))!.keep !== base.d.get(keyOf(i))!.keep);
    if (r !== base)
      for (const i of flips)
        flipsByKey.set(keyOf(i), [...(flipsByKey.get(keyOf(i)) ?? []), `${r.v.name}.r${r.rep}`]);
    const rho = spearman(
      both.map((i) => base.d.get(keyOf(i))!.relevance),
      both.map((i) => r.d.get(keyOf(i))!.relevance),
    );
    const deltas = FIELDS.map((f) => {
      const ds = both.flatMap((i) => {
        const va = r.v.toAnswers
          ? r.v.toAnswers(r.run[keyOf(i)]!.answers)
          : (r.run[keyOf(i)]!.answers as unknown as PolicyAnswers);
        const a = field(va, f);
        const b = field(base.run[keyOf(i)]!.answers as unknown as PolicyAnswers, f);
        return a === undefined || b === undefined ? [] : [Math.abs(a - b)];
      });
      return ds.length
        ? `${(ds.reduce((s, x) => s + x, 0) / ds.length).toFixed(3)} (max ${Math.max(...ds).toFixed(2)})`
        : "—";
    });
    const lab = both.filter((i) => labels.has(keyOf(i)));
    const tp = lab.filter((i) => labels.get(keyOf(i)) && r.d.get(keyOf(i))!.keep).length;
    const fp = lab.filter((i) => !labels.get(keyOf(i)) && r.d.get(keyOf(i))!.keep).length;
    const fn = lab.filter((i) => labels.get(keyOf(i)) && !r.d.get(keyOf(i))!.keep).length;
    const acc = lab.length ? `${pct((lab.length - fp - fn) / lab.length)} of ${lab.length}` : "—";
    out.push(
      `| ${r.v.name}.r${r.rep} | ${kept}/${both.length} | ${r === base ? "—" : flips.length} | ${r === base ? "—" : rho.toFixed(3)} | ${deltas.join(" | ")} | ${acc} | ${tp + fp ? pct(tp / (tp + fp)) : "—"} | ${tp + fn ? pct(tp / (tp + fn)) : "—"} |`,
    );
  }
  out.push(
    ``,
    `Δ = mean absolute difference per answer on a 0–1 scale (scores halved). Flips = keep/drop changes.`,
    ``,
  );
  out.push(`Variants:`, ``, ...VARIANTS.map((v) => `- \`${v.name}\`: ${v.note}`), ``);

  // Noise: the saved production verdicts are one more baseline repeat, a few days earlier.
  const saved = loadPolicyVerdicts();
  if (saved) {
    const same = judged.filter((i) => {
      const e = saved.items[i.id];
      return e && e.stage === i.stage;
    });
    const savedFlips = same.filter(
      (i) =>
        policyRelevance(saved.items[i.id]!.answers, i.jurisdiction, i.news).keep !==
        base.d.get(keyOf(i))!.keep,
    );
    const models = new Set(same.map((i) => saved.items[i.id]!.model));
    out.push(
      `## Saved production verdicts vs baseline.r1`,
      ``,
      `${same.length} items have a saved verdict (models ${[...models].join(", ")}; lab ${[...new Set(Object.values(base.run).map((e) => e.model))].join(", ")}): ${savedFlips.length} keep/drop flips.`,
      ...savedFlips.map((i) => `- ${cell(i.title)} (${i.source})`),
      ``,
    );
  }

  // Flips.
  const flipped = judged.filter((i) => flipsByKey.has(keyOf(i)));
  out.push(
    `## Items that flip (${flipped.length})`,
    ``,
    `| Item | Source | Baseline | Relevance | Flipped by |`,
    `|---|---|---|---|---|`,
  );
  for (const i of flipped.slice(0, 80)) {
    const b = base.d.get(keyOf(i))!;
    out.push(
      `| [${cell(i.title).slice(0, 120)}](${i.link}) | ${cell(i.source)} | ${b.keep ? "keep" : "drop"} | ${b.relevance.toFixed(2)} | ${flipsByKey.get(keyOf(i))!.join(", ")} |`,
    );
  }
  fs.writeFileSync(REPORT_FILE, out.join("\n") + "\n", "utf-8");

  // Labels: flipped items, every baseline keep (precision) and a fixed sample of drops (recall).
  const drops = judged.filter((i) => !base.d.get(keyOf(i))!.keep && !flipsByKey.has(keyOf(i)));
  const sample = drops.filter((_, n) => n % Math.max(1, Math.floor(drops.length / 15)) === 0).slice(0, 15);
  const toLabel = [
    ...flipped,
    ...judged.filter((i) => base.d.get(keyOf(i))!.keep && !flipsByKey.has(keyOf(i))),
    ...sample,
  ];
  const lines = [
    `# Policy Watch labels`,
    ``,
    `Replace \`[ ]\` with \`[k]\` (belongs in the report) or \`[d]\` (does not). Judge the item, not the variants.`,
    `Regenerated by \`report\`; your marks are kept.`,
    ``,
  ];
  for (const i of toLabel) {
    const mark = labels.has(keyOf(i)) ? (labels.get(keyOf(i)) ? "k" : "d") : " ";
    const what = [i.source, i.jurisdiction, i.news ? "news" : "", i.stage ?? ""].filter(Boolean).join(" · ");
    lines.push(`- [${mark}] \`${keyOf(i)}\` **${cell(i.title)}** — ${what} · ${i.link}`);
    if (i.description) lines.push(`  > ${cell(i.description).slice(0, 300)}`);
  }
  fs.writeFileSync(LABELS_FILE, lines.join("\n") + "\n", "utf-8");
  console.log(
    `${REPORT_FILE}: ${runs.length} runs, ${flipped.length} flipped items; ${LABELS_FILE}: ${toLabel.length} items`,
  );
}

// ---------------------------------------------------------------------------

const [cmd, ...rest] = process.argv.slice(2);
const repIdx = rest.indexOf("--repeat");
const repeat = repIdx >= 0 ? Number(rest[repIdx + 1]) : null;
const names = rest.filter((a, n) => !a.startsWith("--") && (repIdx < 0 || n !== repIdx + 1));

const commands: Record<string, () => Promise<void> | void> = {
  fetch: fetchPool,
  enrich,
  run: () => run(names, repeat),
  report,
};
const command = commands[cmd ?? ""];
if (!command) {
  console.error("Usage: jev-lab.ts fetch | enrich | run [variant…] [--repeat N] | report");
  process.exit(1);
}
await command();
