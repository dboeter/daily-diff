/**
 * Hugging Face trending models fetched via the HF Hub API: the models with the
 * most likes gained in the last 7 days (`likes7d`). The API's `likes` is the
 * all-time total and `downloads` the last 30 days (`downloadsAllTime` is the
 * total: openai-community/gpt2 had 21.8M against 951M on 2026-10-26).
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HfModel {
  id: string; // e.g. "meta-llama/Llama-3.1-8B"
  author: string;
  likes: number;
  downloads: number;
  tags: string[];
  pipelineTag: string;
  /** Parameter count from the safetensors metadata; null without one. */
  parameters: number | null;
  lastModified: string;
  url: string;
}

export interface HfData {
  models: HfModel[];
  fetchSuccess: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Trends shows at most this many. */
const HF_FETCH_LIMIT = 15;
const API_URL = "https://huggingface.co/api/models";

// ---------------------------------------------------------------------------
// Response type
// ---------------------------------------------------------------------------

export interface HfApiModel {
  _id: string;
  id: string;
  author?: string;
  likes: number;
  downloads: number;
  tags?: string[];
  pipeline_tag?: string;
  lastModified?: string;
  safetensors?: { total?: number };
}

export function toHfModel(m: HfApiModel): HfModel {
  return {
    id: m.id,
    author: m.author ?? m.id.split("/")[0] ?? "unknown",
    likes: m.likes,
    downloads: m.downloads,
    tags: m.tags ?? [],
    pipelineTag: m.pipeline_tag ?? "",
    parameters: typeof m.safetensors?.total === "number" ? m.safetensors.total : null,
    lastModified: m.lastModified ?? "",
    url: `https://huggingface.co/${m.id}`,
  };
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

export async function fetchHfData(): Promise<HfData> {
  try {
    // Fetch trending models (sorted by likes, recently modified)
    const params = new URLSearchParams({
      sort: "likes7d",
      direction: "-1",
      limit: String(HF_FETCH_LIMIT),
    });
    // With `expand`, the API returns only the fields named.
    for (const field of [
      "author",
      "likes",
      "downloads",
      "tags",
      "pipeline_tag",
      "lastModified",
      "safetensors",
    ]) {
      params.append("expand[]", field);
    }

    const resp = await fetch(`${API_URL}?${params}`, {
      headers: { "User-Agent": "daily-diff/1.0" },
    });

    if (!resp.ok) {
      console.error(`  [hf] HTTP ${resp.status}`);
      return { models: [], fetchSuccess: false };
    }

    const raw = (await resp.json()) as HfApiModel[];
    const models: HfModel[] = raw.map(toHfModel);

    console.log(`  [hf] ${models.length} trending models`);
    return { models, fetchSuccess: models.length > 0 };
  } catch (err) {
    console.error(`  [hf] fetch failed: ${err}`);
    return { models: [], fetchSuccess: false };
  }
}

// ---------------------------------------------------------------------------
// Release rows (Trends' Hugging Face table)
// ---------------------------------------------------------------------------

/** Re-uploads that only strip safety tuning: not a release of their own. */
const UNCENSORED_RE = /uncensored|abliterated/i;

/** A name segment that marks a quantised or reformatted copy of a release. */
const VARIANT_TOKEN_RE =
  /^(?:gguf|fp8|fp4|nvfp4|awq|gptq|mlx|bnb|int4|int8|[2-8]bit|exl2|exl3|quantized|onnx)$/i;

/** One release: its original upload and the quantised copies of it in the same list. */
export interface HfRow extends HfModel {
  variants: HfModel[];
}

const baseName = (id: string) => (id.split("/").pop() ?? id).toLowerCase();

/**
 * Whether `variant` is a quantised or reformatted copy of `base`: its name is
 * the base's name plus segments, one of which is a format token
 * (`ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF` of
 * `deepseek-ai/DeepSeek-V4.1-Flash-1017`, `unsloth/flint-GGUF` of `RecursiveSI/flint`).
 */
export function isVariantOf(variant: string, base: string): boolean {
  const v = baseName(variant);
  const b = baseName(base);
  if (!v.startsWith(`${b}-`)) return false;
  return v
    .slice(b.length + 1)
    .split(/[-_]/)
    .some((seg) => VARIANT_TOKEN_RE.test(seg));
}

/**
 * The Hub's trending models as Trends' rows, in its order: uncensored
 * re-uploads left out, and one row per release, at its first position, led by
 * the original upload with its quantised copies as `variants` (3 of 15 rows
 * were one DeepSeek release on 2026-10-26).
 */
export function hfReleaseRows(models: HfModel[]): HfRow[] {
  const kept = models.filter((m) => !UNCENSORED_RE.test(m.id));
  const baseOf = (m: HfModel) => kept.find((b) => b !== m && isVariantOf(m.id, b.id));
  const rows: HfRow[] = [];
  const rowOf = new Map<HfModel, HfRow>();
  for (const m of kept) {
    if (baseOf(m)) continue;
    const row = { ...m, variants: [] };
    rowOf.set(m, row);
    rows.push(row);
  }
  for (const m of kept) {
    // Names only grow along the chain, so this ends at an original upload.
    let base = baseOf(m);
    while (base && baseOf(base)) base = baseOf(base);
    if (base) rowOf.get(base)?.variants.push(m);
  }
  // A variant ranked above its original moves the row up to its place.
  const position = (r: HfRow) =>
    Math.min(...[r, ...r.variants].map((m) => kept.findIndex((k) => k.id === m.id)));
  return rows.sort((a, b) => position(a) - position(b));
}

/** A parameter count as people write it: 27.4e9 → "27B", 763e9 → "763B", 4.3e8 → "430M". */
export function formatParameters(n: number): string {
  if (n >= 1e9) return `${Number((n / 1e9).toFixed(n >= 1e10 ? 0 : 1))}B`;
  return `${Math.round(n / 1e6)}M`;
}

/**
 * What a row shows without a summary: its task and size ("Image text to text,
 * 763B parameters"); "" with neither, and then the row is never a Highlight.
 */
export function hfDescription(m: Pick<HfModel, "pipelineTag" | "parameters">): string {
  const task = m.pipelineTag.replace(/-/g, " ");
  const size = m.parameters !== null ? `${formatParameters(m.parameters)} parameters` : "";
  const text = [task, size].filter(Boolean).join(", ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** The lowercased state keys of a row and its variants (`StarHistory.reported`), for 🔥. */
export const hfKeys = (row: HfRow): string[] => [row, ...row.variants].map((m) => `hf:${m.id.toLowerCase()}`);
