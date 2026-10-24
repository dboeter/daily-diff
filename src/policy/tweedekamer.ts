/**
 * Dutch parliament (no keys): the Tweede Kamer OData API and KOOP's SRU
 * search of the official publications.
 *
 * - Motions, government letters and written questions started in the last
 *   NEWS_MAX_AGE_DAYS whose subject names AI (`keywordHit`), then Jev.
 *   Filtered on `GestartOp`, not `ApiGewijzigdOp`: metadata edits would bring
 *   a Zaak back after the state has forgotten it (REPORTED_KEEP_DAYS).
 * - Bills only by dossier number (config.yml `policy.watchlist.nl`): their
 *   titles name the EU regulation they implement, not AI. One stage item per
 *   dossier, from the Tweede Kamer vote on.
 */

import type { PolicyItem } from "./items.ts";
import type { PolicySourceContext } from "./sources.ts";
import { keywordHit } from "./relevance.ts";
import { markStaleOnFirstSight } from "../core/report-state.ts";
import { NEWS_MAX_AGE_DAYS, tagText } from "../core/rss.ts";
import { fetchOk } from "../core/http.ts";
import { DAY_MS } from "../core/date.ts";

const ODATA_URL = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0/Zaak";
const SRU_URL = "https://repository.overheid.nl/sru";
/** The OData API caps `$top` at 250 and sends no next link; ~300 Zaken of these types a week. */
const PAGE_SIZE = 250;
const MAX_PAGES = 8;

const DOSSIER_RE = /^\d+$/;

const ZAAK_TYPES: Record<string, string> = {
  Motie: "Motion",
  "Brief regering": "Government letter",
  "Schriftelijke vragen": "Written questions",
};

/** Tweede Kamer vote outcomes (`Besluit.BesluitSoort`); every earlier step is no stage. */
const VOTES: Record<string, string> = {
  "Stemmen - aangenomen": "Passed the Tweede Kamer",
  "Stemmen - zonder stemming aannemen": "Passed the Tweede Kamer",
  "Stemmen - verworpen": "Rejected by the Tweede Kamer",
  "Stemmen - niet aangenomen": "Rejected by the Tweede Kamer",
};
/** Stage order, for two stages on one day: the later one wins. */
const ORDER = [
  "Passed the Tweede Kamer",
  "Rejected by the Tweede Kamer",
  "In the Eerste Kamer",
  "Enacted (Staatsblad)",
];

interface Besluit {
  BesluitSoort: string;
  Verwijderd: boolean;
  Agendapunt?: { Activiteit?: { Datum?: string } | null } | null;
}

interface Zaak {
  Nummer: string;
  Soort: string;
  Titel: string | null;
  Onderwerp: string | null;
  GestartOp: string;
  Document?: { DocumentNummer: string }[];
}

type Stage = { stage: string; date: string };

const later = (a: Stage | null, b: Stage): Stage =>
  !a || b.date > a.date || (b.date === a.date && ORDER.indexOf(b.stage) > ORDER.indexOf(a.stage)) ? b : a;

/**
 * A bill's latest stage: the Tweede Kamer vote (date from its agenda item), the
 * Eerste Kamer's `kst-<nr>-A` (it has the bill) or a Staatsblad publication
 * (enacted), dated by KOOP's `available`, never `issued`, which lags by weeks.
 * Null before the vote.
 */
export function billStage(besluiten: Besluit[], koopXml: string): Stage | null {
  let best: Stage | null = null;
  for (const b of besluiten) {
    const stage = VOTES[b.BesluitSoort];
    const date = b.Agendapunt?.Activiteit?.Datum?.slice(0, 10);
    if (stage && date && !b.Verwijderd) best = later(best, { stage, date });
  }
  for (const [, rec] of koopXml.matchAll(/<sru:record>([\s\S]*?)<\/sru:record>/g)) {
    const id = tagText(rec!, "dcterms:identifier");
    const date = tagText(rec!, "dcterms:available");
    if (!date) continue;
    if (id.startsWith("stb-")) best = later(best, { stage: "Enacted (Staatsblad)", date });
    else if (/^kst-\d+-A$/.test(id) && tagText(rec!, "dcterms:creator").startsWith("Eerste Kamer")) {
      best = later(best, { stage: "In the Eerste Kamer", date });
    }
  }
  return best;
}

/** The OData Zaken whose subject or dossier title names AI. */
export function parseZaken(json: unknown): PolicyItem[] {
  return (json as { value: Zaak[] }).value.flatMap((z) => {
    const title = z.Onderwerp ?? z.Titel ?? z.Nummer;
    const description = [ZAAK_TYPES[z.Soort] ?? z.Soort, z.Titel].filter(Boolean).join(". ");
    if (!keywordHit({ title, description })) return [];
    const doc = z.Document?.[0]?.DocumentNummer;
    return [
      {
        id: `tk:${z.Nummer}`,
        title,
        // The detail page needs the document number; without one, the site search finds the Zaak.
        link: doc
          ? `https://www.tweedekamer.nl/kamerstukken/detail?id=${z.Nummer}&did=${doc}`
          : `https://www.tweedekamer.nl/zoeken?qry=${z.Nummer}`,
        // The Amsterdam date: a UTC timestamp would put midnight on the day before.
        published: z.GestartOp.slice(0, 10),
        description,
        source: "Tweede Kamer",
        jurisdiction: "nl",
        jevOnly: false,
      },
    ];
  });
}

const get = (url: string, accept: string): Promise<Response> => fetchOk(url, { headers: { Accept: accept } });

const odata = (filter: string, rest: string) => `${ODATA_URL}?$filter=${encodeURIComponent(filter)}&${rest}`;

async function fetchZaken(now: Date): Promise<PolicyItem[]> {
  const since = new Date(now.getTime() - NEWS_MAX_AGE_DAYS * DAY_MS).toISOString().slice(0, 19) + "Z";
  const types = Object.keys(ZAAK_TYPES)
    .map((t) => `Soort eq '${t}'`)
    .join(" or ");
  const items: PolicyItem[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const url = odata(
      `Verwijderd eq false and GestartOp ge ${since} and (${types})`,
      `$select=Nummer,Soort,Titel,Onderwerp,GestartOp&$expand=Document($select=DocumentNummer)` +
        `&$orderby=Id&$top=${PAGE_SIZE}&$skip=${page * PAGE_SIZE}`,
    );
    const json = (await (await get(url, "application/json")).json()) as { value: Zaak[] };
    items.push(...parseZaken(json));
    if (json.value.length < PAGE_SIZE) break;
  }
  return items;
}

async function fetchBill(dossier: string, ctx: PolicySourceContext): Promise<PolicyItem | null> {
  const zaakUrl = odata(
    `Kamerstukdossier/any(d:d/Nummer eq ${dossier}) and Soort eq 'Wetgeving' and Verwijderd eq false`,
    "$select=Nummer,Titel&$expand=Kamerstukdossier($select=Nummer,Citeertitel)," +
      "Besluit($select=BesluitSoort,Verwijderd;$expand=Agendapunt($select=Id;$expand=Activiteit($select=Datum)))",
  );
  // The Staatsblad carries the dossier as `behandeldDossier`, not `dossiernummer`.
  const cql = `(w.dossiernummer==${dossier} and dt.identifier==kst-${dossier}-A) or (w.behandeldDossier==${dossier} and w.publicatienaam==Staatsblad)`;
  const [zaakRes, koopRes] = await Promise.all([
    get(zaakUrl, "application/json"),
    get(`${SRU_URL}?query=${encodeURIComponent(cql)}&maximumRecords=20`, "application/xml"),
  ]);
  const zaak = (
    (await zaakRes.json()) as {
      value: (Zaak & { Besluit: Besluit[]; Kamerstukdossier: { Citeertitel: string | null }[] })[];
    }
  ).value[0];
  const latest = billStage(zaak?.Besluit ?? [], await koopRes.text());
  if (!latest) return null;
  const id = `nl:${dossier}`;
  const item: PolicyItem = {
    id,
    title: zaak?.Kamerstukdossier[0]?.Citeertitel ?? zaak?.Titel ?? `Kamerstuk ${dossier}`,
    link: `https://www.tweedekamer.nl/kamerstukken/wetsvoorstellen/detail?cfg=wetsvoorsteldetails&qry=wetsvoorstel%3A${dossier}`,
    published: latest.date,
    // Carries the dossier number, which is what the watchlist match (policy/relevance.ts) reads.
    description: `Dutch bill, Kamerstuk ${dossier}. ${zaak?.Titel ?? ""}`.trim(),
    source: "Tweede Kamer",
    jurisdiction: "nl",
    jevOnly: false,
    stage: latest.stage,
  };
  return markStaleOnFirstSight(ctx, item, latest.date);
}

/** The keyword search and one bill per watchlisted dossier; a failing part is skipped, all failing throws. */
export async function fetchTweedeKamer(ctx: PolicySourceContext): Promise<PolicyItem[]> {
  const dossiers = ctx.config.watchlist.nl.filter((w) => DOSSIER_RE.test(w));
  const parts = [
    { name: "Zaak search", run: () => fetchZaken(ctx.now) },
    ...dossiers.map((d) => ({
      name: `dossier ${d}`,
      run: async () => [await fetchBill(d, ctx)].filter((i) => i !== null),
    })),
  ];
  const results = await Promise.all(
    parts.map(async (p) => {
      try {
        return await p.run();
      } catch (err) {
        console.error(`  [policy] Tweede Kamer ${p.name} failed: ${err}`);
        return err instanceof Error ? err : new Error(String(err));
      }
    }),
  );
  const failed = results.filter((r) => r instanceof Error);
  if (failed.length === results.length) throw failed[0];
  return results.flatMap((r) => (r instanceof Error ? [] : r));
}
