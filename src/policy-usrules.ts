/**
 * US federal rules: the Federal Register API (no key) and Regulations.gov v4
 * (`USA_GOV_API_KEY`, api.data.gov), one source so Regulations.gov can be
 * deduplicated against the Federal Register by docket id.
 *
 * Federal Register: every document published in the window (one request; ~100
 * a day), kept when its title or abstract names AI (`keywordHit`; full-text
 * search was noise in the spike), when it is a presidential document (Jev drops
 * proclamations), or when a docket/RIN is on `policy.watchlist.us_federal`.
 * Regulations.gov: an "artificial intelligence" search over Notices, Proposed
 * Rules and Rules posted in the window (one request); a document whose docket
 * the Federal Register returned in the same window is dropped, kept or not
 * there: the Federal Register already judged it. Both give `deadline`.
 */

import type { PolicyItem } from "./policy.ts";
import type { PolicySourceContext } from "./policy-sources.ts";
import { keywordHit, watchlisted } from "./policy-jev.ts";
import { apiKeyFor, fetchOk } from "./http.ts";
import { daysBefore } from "./date.ts";

const FR_URL = "https://www.federalregister.gov/api/v1/documents.json";
const REGS_URL = "https://api.regulations.gov/v4/documents";
/** Covers a missed run; the policy state drops repeats. Also: dateStr is CST, a day ahead of US publication. */
const LOOKBACK_DAYS = 7;
/** The API's maximum: a 7-day window (~700 documents) is one page. */
const FR_PER_PAGE = 1000;
const REGS_PAGE_SIZE = 250;
const FR_FIELDS = [
  "document_number",
  "type",
  "subtype",
  "title",
  "abstract",
  "publication_date",
  "comments_close_on",
  "docket_ids",
  "regulation_id_numbers",
  "html_url",
  "agencies",
  "regulations_dot_gov_info",
];

interface FrDoc {
  document_number: string;
  type: string;
  subtype: string | null;
  title: string;
  abstract: string | null;
  publication_date: string;
  comments_close_on: string | null;
  docket_ids: string[];
  regulation_id_numbers: string[];
  html_url: string;
  agencies: { name?: string }[];
  regulations_dot_gov_info?: { docket_id?: string; document_id?: string };
}

interface RegsDoc {
  id: string;
  attributes: {
    agencyId: string;
    frDocNum: string | null;
    documentType: string;
    commentEndDate: string | null;
    postedDate: string;
    title: string;
    docketId: string;
  };
}

async function getJson<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
  return (await (await fetchOk(url, { headers })).json()) as T;
}

/** The Regulations.gov docket: given, or the document id minus its `-NNNN` sequence (FCC rows). */
function frDocket(d: FrDoc): string | undefined {
  const info = d.regulations_dot_gov_info;
  return info?.docket_id ?? info?.document_id?.replace(/-\d+$/, "");
}

function frItem(d: FrDoc): PolicyItem {
  const agency = d.agencies.find((a) => a.name)?.name;
  const ids = [...d.docket_ids, frDocket(d) ?? [], ...d.regulation_id_numbers.map((r) => `RIN ${r}`)].flat();
  return {
    id: `us-fr:${d.document_number}`,
    title: agency ? `${agency}: ${d.title}` : d.title,
    link: d.html_url,
    published: d.publication_date,
    // Carries the dockets and RINs, which is what the watchlist match (policy-jev.ts) reads.
    description: [`${d.subtype ?? d.type}.`, d.abstract ?? "", ids.length ? `(${ids.join("; ")})` : ""]
      .filter(Boolean)
      .join(" "),
    source: "Federal Register",
    jurisdiction: "us_federal",
    jevOnly: false,
    ...(d.comments_close_on ? { deadline: d.comments_close_on } : {}),
  };
}

async function fetchFederalRegister(since: string): Promise<FrDoc[]> {
  const params = new URLSearchParams({
    per_page: String(FR_PER_PAGE),
    "conditions[publication_date][gte]": since,
  });
  for (const f of FR_FIELDS) params.append("fields[]", f);
  const body = await getJson<{ total_pages?: number; results?: FrDoc[] }>(`${FR_URL}?${params}`);
  if ((body.total_pages ?? 1) > 1)
    console.log("  [policy] Federal Register: more than one page, the rest skipped");
  return body.results ?? [];
}

async function fetchRegulationsGov(since: string, key: string): Promise<RegsDoc[]> {
  const params = new URLSearchParams({
    "filter[searchTerm]": '"artificial intelligence"',
    "filter[postedDate][ge]": since,
    "filter[documentType]": "Notice,Proposed Rule,Rule",
    "page[size]": String(REGS_PAGE_SIZE),
    sort: "-postedDate",
  });
  // The key goes in a header, not `api_key=`, so it never lands in a logged URL.
  return (await getJson<{ data: RegsDoc[] }>(`${REGS_URL}?${params}`, { "X-Api-Key": key })).data;
}

/** A timestamp's date in US Eastern time: a comment period ends 23:59:59 Eastern, the next day in UTC. */
const easternDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/New_York" });

function regsItem(d: RegsDoc): PolicyItem {
  const a = d.attributes;
  return {
    // Same id as its Federal Register document, so the state also dedupes it across days.
    id: a.frDocNum ? `us-fr:${a.frDocNum}` : `regs:${d.id}`,
    title: `${a.agencyId}: ${a.title}`,
    link: `https://www.regulations.gov/document/${d.id}`,
    published: easternDate(a.postedDate),
    description: `${a.documentType}. (${a.docketId})`,
    source: "Regulations.gov",
    jurisdiction: "us_federal",
    jevOnly: false,
    ...(a.commentEndDate ? { deadline: easternDate(a.commentEndDate) } : {}),
  };
}

/** Throws only when both sources fail; a missing key skips Regulations.gov. */
export async function fetchUsRules(ctx: PolicySourceContext): Promise<PolicyItem[]> {
  const since = daysBefore(ctx.dateStr, LOOKBACK_DAYS);
  const key = apiKeyFor("USA_GOV_API_KEY", "Regulations.gov");
  const [fr, regs] = await Promise.allSettled([
    fetchFederalRegister(since),
    key ? fetchRegulationsGov(since, key) : Promise.resolve([]),
  ]);
  if (fr.status === "rejected" && regs.status === "rejected") throw fr.reason;
  if (fr.status === "rejected") console.error(`  [policy] Federal Register failed: ${fr.reason}`);
  if (regs.status === "rejected") console.error(`  [policy] Regulations.gov failed: ${regs.reason}`);

  const frDocs = fr.status === "fulfilled" ? fr.value : [];
  const watchlist = ctx.config.watchlist.usFederal;
  const frItems = frDocs
    .map((d) => ({ d, item: frItem(d) }))
    .filter(
      ({ d, item }) =>
        keywordHit({ title: d.title, description: d.abstract ?? "" }) ||
        d.type === "Presidential Document" ||
        watchlisted(item, watchlist),
    )
    .map(({ item }) => item);
  const frDockets = new Set(frDocs.map(frDocket));
  // On its publication day a document often has no regulations.gov docket yet: match its number too.
  const frNumbers = new Set(frDocs.map((d) => d.document_number));
  const regsItems = (regs.status === "fulfilled" ? regs.value : [])
    .filter((d) => !frDockets.has(d.attributes.docketId) && !frNumbers.has(d.attributes.frDocNum ?? ""))
    .map(regsItem);
  return [...frItems, ...regsItems];
}
