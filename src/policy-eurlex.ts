/**
 * EUR-Lex via the Publications Office's Cellar SPARQL endpoint (no key): EU
 * acts and preparatory documents whose English title names AI or a watchlisted
 * regulation number. The stage comes from the CELEX number.
 *
 * `work_date_document` is the document's own date, not when it entered
 * EUR-Lex: consolidated texts and late publications arrive back-dated, so each
 * run queries a 30-day look-back and the state (`stages`) drops what an
 * earlier run reported.
 */

import type { PolicyItem } from "./policy.ts";
import type { PolicySourceContext } from "./policy-sources.ts";

const SPARQL_URL = "https://publications.europa.eu/webapi/rdf/sparql";
const LOOKBACK_DAYS = 30;
// A year's look-back took 19 s on 2026-10-13; 30 days answers in seconds.
const FETCH_TIMEOUT_MS = 60_000;
const TITLE_MAX_CHARS = 200;

/** A regulation or directive number in the watchlist (`2024/1689`); procedures (`2025/0359(COD)`) are the EP's. */
const ACT_NUMBER_RE = /^\d{4}\/\d{1,4}$/;

const SECTOR_5_STAGES: Record<string, string> = {
  PC: "Commission proposal",
  AP: "Parliament position",
  AG: "Council position",
  IP: "Parliament resolution",
  DC: "Commission communication",
};

const SECTOR_3_STAGES: Record<string, string> = {
  R: "Regulation adopted",
  L: "Directive adopted",
  D: "Decision adopted",
};

/**
 * The stage a CELEX number stands for; null drops the document. Dropped: staff
 * working documents (`SC`, each accompanies a proposal that is listed itself)
 * and numbers without a sector digit (`C/2026/04668`, an EPSO notice that
 * matched the AI title search). Other types get a generic stage and Jev judges them.
 */
export function celexStage(celex: string): string | null {
  if (/^0\d{4}[A-Z]/.test(celex)) return "Consolidated text";
  const m = celex.match(/^([35])\d{4}([A-Z]{1,2})\d/);
  if (!m) return null;
  const [, sector, type] = m;
  if (sector === "3") {
    if (/R\(\d+\)$/.test(celex)) return "Corrigendum";
    return SECTOR_3_STAGES[type!] ?? "Published in the Official Journal";
  }
  if (type === "SC") return null;
  return SECTOR_5_STAGES[type!] ?? "Preparatory document";
}

export function eurLexQuery(since: string, actNumbers: string[]): string {
  // Act numbers are digits and a slash: nothing to escape in the regex.
  const terms = ["artificial intelligence", ...actNumbers].join("|");
  return `PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>
SELECT DISTINCT ?celex ?date ?title WHERE {
  ?work cdm:resource_legal_id_celex ?celex ;
        cdm:work_date_document ?date .
  ?expr cdm:expression_belongs_to_work ?work ;
        cdm:expression_uses_language <http://publications.europa.eu/resource/authority/language/ENG> ;
        cdm:expression_title ?title .
  FILTER(?date >= "${since}"^^xsd:date)
  FILTER(REGEX(STR(?title), "${terms}", "i"))
} ORDER BY DESC(?date) LIMIT 200`;
}

interface SparqlResults {
  results: { bindings: Record<"celex" | "date" | "title", { value: string }>[] };
}

/** One item per CELEX (a work can have several English expressions), in result order. */
export function parseEurLexResults(json: unknown): PolicyItem[] {
  const seen = new Set<string>();
  return (json as SparqlResults).results.bindings.flatMap((b): PolicyItem[] => {
    const celex = b.celex.value;
    const stage = celexStage(celex);
    if (!stage || seen.has(celex)) return [];
    seen.add(celex);
    const title = b.title.value.replace(/\s+/g, " ").trim();
    return [
      {
        id: `celex:${celex}`,
        title: title.length > TITLE_MAX_CHARS ? `${title.slice(0, TITLE_MAX_CHARS)}…` : title,
        link: `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:${celex}`,
        published: b.date.value,
        description: "",
        source: "EUR-Lex",
        jurisdiction: "eu",
        jevOnly: false,
        stage,
      },
    ];
  });
}

export async function fetchEurLex(ctx: PolicySourceContext): Promise<PolicyItem[]> {
  const since = new Date(ctx.now.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const res = await fetch(SPARQL_URL, {
    method: "POST",
    headers: {
      "User-Agent": "daily-diff/1.0",
      Accept: "application/sparql-results+json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      query: eurLexQuery(
        since,
        ctx.config.watchlist.eu.filter((w) => ACT_NUMBER_RE.test(w)),
      ),
    }).toString(),
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseEurLexResults(await res.json());
}
