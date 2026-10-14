/**
 * internetconsultatie.nl, the Dutch government's consultation site (no key).
 * It has no API or RSS, but its homepage lists every open consultation
 * server-side (42 on 2026-10-14), so each run parses that list: only open
 * consultations, so a first run reports no closed history. Kept: those whose
 * title or summary passes `keywordHit` (0 of 42 on 2026-10-14; the
 * Uitvoeringswet AI-verordening, spring 2026, was one). The closing date is
 * the item's deadline. Breaks when the markup changes: zero parsed throws.
 */

import type { PolicyItem } from "./policy.ts";
import type { PolicySourceContext } from "./policy-sources.ts";
import { keywordHit } from "./policy-jev.ts";
import { plainText } from "./rss.ts";

const SITE = "https://www.internetconsultatie.nl";
const FETCH_TIMEOUT_MS = 30_000;

export interface Consultation {
  slug: string;
  title: string;
  /** ISO date of `Sluitingsdatum`. */
  closes: string;
  ministry: string;
  summary: string;
}

/** DD-MM-YYYY → YYYY-MM-DD; "" when absent. */
const isoDate = (s: string | undefined): string => {
  const m = s?.match(/(\d{2})-(\d{2})-(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
};

/** The homepage's "Lopende consultaties" list (`result--title` entries; the featured cards above it are skipped). */
export function parseConsultations(html: string): Consultation[] {
  const list = [
    ...html.matchAll(/<h3 class="result--title\s*">([\s\S]*?)(?=<h3 class="result--title|$)/g),
  ].map(([, body]) => {
    const link = body!.match(/<a href="\/([^"/]+)\/[^"]*"[^>]*>([\s\S]*?)<\/a>/);
    const meta = [...body!.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(([, li]) => plainText(li!));
    return {
      slug: link?.[1] ?? "",
      title: plainText(link?.[2] ?? ""),
      closes: isoDate(meta.find((m) => m.startsWith("Sluitingsdatum"))),
      ministry: meta.find((m) => !m.startsWith("Sluitingsdatum")) ?? "",
      summary: plainText(body!.match(/<\/ul>([\s\S]*?)<\/li>/)?.[1] ?? ""),
    };
  });
  const valid = list.filter((c) => c.slug && c.title && c.closes);
  if (valid.length === 0) throw new Error("no consultations parsed (markup changed?)");
  return valid;
}

async function get(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "daily-diff/1.0" },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/**
 * The open AI consultations, as stage items: the state then reports each once
 * and never again while it stays open (a plain item's id is forgotten after
 * 30 days, but a consultation can run for months). The stage key needs a fixed
 * date, and the list has no opening date, so each kept consultation's detail
 * page is fetched for its `Startdatum consultatie`.
 */
export async function fetchInternetConsultatie(_ctx: PolicySourceContext): Promise<PolicyItem[]> {
  const all = parseConsultations(await get(`${SITE}/`));
  console.log(`  [policy] Internetconsultatie: ${all.length} open consultations`);
  const ai = all.filter((c) => keywordHit({ title: c.title, description: c.summary }));
  return Promise.all(
    ai.map(async (c): Promise<PolicyItem> => {
      const link = `${SITE}/${c.slug}/b1`;
      const detail = await get(link);
      const start = isoDate(detail.match(/Startdatum consultatie<\/th>\s*<td>\s*([\d-]+)/)?.[1]);
      if (!start) throw new Error(`no Startdatum on ${link}`);
      return {
        id: `internetconsultatie:${c.slug}`,
        title: c.title,
        link,
        published: start,
        description: [c.ministry && `${c.ministry}.`, c.summary].filter(Boolean).join(" "),
        source: "Internetconsultatie",
        jurisdiction: "nl",
        jevOnly: false,
        stage: "Open for consultation",
        deadline: c.closes,
      };
    }),
  );
}
