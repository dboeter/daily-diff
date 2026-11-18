// Step 2 of the page grammar: replays captured production prompts with the old and the new rule
// text on the production model. Usage (free model; needs OPENROUTER_API_KEY in .env):
//   LLM_PROVIDER=openrouter OPENROUTER_MODEL=baidu/ernie-5.5-flash-preview:free OPENROUTER_REASONING_EFFORT=high \
//     node --env-file=.env --import tsx .scratch/page-grammar/replay.ts <capture folder>...
// Output: .scratch/page-grammar/replay/<run>/<label>.{old,new}.md (old: rerun for the project
// digests, the captured answer for the rest).
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { callLlm } from "../../src/core/llm.ts";

const edits = JSON.parse(readFileSync(new URL("./edits.json", import.meta.url), "utf8")) as Record<string, [string, string][]>;
const kindOf = (label: string): string | null =>
  label === "agents" || label === "infra" || /^data-(?!vendor|highlights)/.test(label)
    ? "digest"
    : label === "agents-highlights" || label === "models-highlights"
      ? "highlights"
      : label === "data-vendor-summaries"
        ? "vendor"
        : null;

const jobs: Promise<void>[] = [];
for (const dir of process.argv.slice(2)) {
  const out = join(new URL("./replay/", import.meta.url).pathname, basename(dir));
  mkdirSync(out, { recursive: true });
  for (const f of readdirSync(dir).sort()) {
    const cap = JSON.parse(readFileSync(join(dir, f), "utf8")) as { label: string; maxTokens: number; prompt: string; output?: string };
    const kind = kindOf(cap.label);
    if (!kind) continue;
    let next = cap.prompt;
    for (const [from, to] of edits[kind]!) {
      if (!next.includes(from)) throw new Error(`${f}: old rule text not found: ${from.slice(0, 50)}`);
      next = next.replace(from, to);
    }
    const run = async (which: "old" | "new", prompt: string) => {
      const path = join(out, `${cap.label}.${which}.md`);
      if (existsSync(path)) return;
      writeFileSync(path, await callLlm(prompt, cap.maxTokens, `${cap.label}-${which}`));
      console.log(`wrote ${path}`);
    };
    jobs.push(run("new", next).catch((e) => console.error(`${f} new: ${e}`)));
    if (kind === "digest") jobs.push(run("old", cap.prompt).catch((e) => console.error(`${f} old: ${e}`)));
    else if (cap.output !== undefined) writeFileSync(join(out, `${cap.label}.old.md`), cap.output);
  }
}
await Promise.all(jobs);
