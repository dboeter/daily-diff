// Step 2 check: the vendor summaries prompt, old and new rule, over the notes behind the saved
// Action required rows (data-state.json `actions`; note text from the candidates.json of any day).
// Usage: as replay.ts. Output: .scratch/page-grammar/replay/actions.{old,new}.md
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { callLlm, LLM_TOKENS_LISTING } from "../../src/core/llm.ts";
import { buildDataSummariesPrompt } from "../../src/reports/prompts-pages.ts";

const root = new URL("../../", import.meta.url).pathname;
const actions = Object.values(JSON.parse(readFileSync(`${root}digests/data-state.json`, "utf8")).actions) as {
  title: string; link: string; date: string; source: string;
}[];
const texts = new Map<string, string>();
for (const d of readdirSync(`${root}digests`).filter((d) => /^\d{4}-\d\d-\d\d$/.test(d)).sort()) {
  const f = `${root}digests/${d}/candidates.json`;
  if (!existsSync(f)) continue;
  const c = JSON.parse(readFileSync(f, "utf8"));
  for (const it of (Array.isArray(c) ? c : (c.items ?? c.candidates ?? [])) as { title?: string; link?: string; text?: string; kind?: string }[])
    if (it.text && it.kind !== "open-action" && it.title) texts.set(it.title, it.text);
}
const items = actions
  .filter((a) => texts.has(a.title))
  .map((a, i) => ({ ...a, n: i + 1, description: texts.get(a.title)!, deprecation: true, stage: "", date: "" }));
console.log(`${actions.length} action rows, ${items.length} with their note text`);
const next = buildDataSummariesPrompt(items as never, "2026-11-18");
const [from, to] = (JSON.parse(readFileSync(new URL("./edits.json", import.meta.url), "utf8")) as Record<string, [string, string][]>).vendor![0]!;
if (!next.includes(to)) throw new Error("new rule text not in the prompt");
const out = new URL("./replay/", import.meta.url).pathname;
writeFileSync(`${out}actions.rows.md`, items.map((it) => `${it.n}. ${it.title} (${it.source}) — ${it.description}`).join("\n"));
await Promise.all(
  ([["new", next], ["old", next.replace(to, from)]] as const).map(async ([w, p]) =>
    writeFileSync(`${out}actions.${w}.md`, await callLlm(p, LLM_TOKENS_LISTING, `actions-${w}`)),
  ),
);
