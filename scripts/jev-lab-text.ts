/**
 * Full text for the Jev lab's `full_text` variants: the document behind a
 * policy item's link, as plain text. Production sends Jev the feed's
 * description only, which is often a teaser or a label ("Government letter").
 * Each source with a better route than its web page gets one; the rest go
 * through a generic article extractor.
 */

import zlib from "node:zlib";
import { plainText } from "../src/rss.ts";
import type { PolicyItem } from "../src/policy.ts";

const UA = { "User-Agent": "Mozilla/5.0 (compatible; daily-diff/1.0)" };
const TIMEOUT_MS = 30_000;
/** Kept per item; the variants cut it shorter. */
export const BODY_MAX_CHARS = 8000;

async function get(url: string): Promise<Response> {
  const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}
const squeeze = (s: string): string => s.replace(/\s+/g, " ").trim();

/**
 * The densest run of paragraphs: <p>/<li>/<h2>/<h3> blocks whose markup gaps
 * stay short, the run with the most text wins. Sidebars and teaser lists are
 * separated from the article by long stretches of markup.
 */
export function articleText(html: string): string {
  const clean = html.replace(
    /<(script|style|nav|header|footer|aside|form|noscript|svg)\b[\s\S]*?<\/\1>/gi,
    " ",
  );
  const blocks = [...clean.matchAll(/<(p|li|h2|h3|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => ({
    start: m.index,
    end: m.index + m[0].length,
    text: plainText(m[2]!, 100_000),
  }));
  const MAX_GAP = 1500;
  let best: string[] = [];
  let bestLen = 0;
  let run: string[] = [];
  let runLen = 0;
  let prevEnd = -Infinity;
  for (const b of blocks) {
    if (b.start - prevEnd > MAX_GAP) {
      run = [];
      runLen = 0;
    }
    prevEnd = b.end;
    // Teaser links and labels are short; a run is made of sentences.
    if (b.text.length < 40) continue;
    run.push(b.text);
    runLen += b.text.length;
    if (runLen > bestLen) {
      best = [...run];
      bestLen = runLen;
    }
  }
  return best.join("\n");
}

/** One file out of a .zip (a .docx), via the central directory. */
function unzipEntry(zip: Buffer, name: string): Buffer | null {
  const eocd = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0) return null;
  let p = zip.readUInt32LE(eocd + 16);
  const count = zip.readUInt16LE(eocd + 10);
  for (let n = 0; n < count; n++) {
    const method = zip.readUInt16LE(p + 10);
    const size = zip.readUInt32LE(p + 20);
    const nameLen = zip.readUInt16LE(p + 28);
    const next = p + 46 + nameLen + zip.readUInt16LE(p + 30) + zip.readUInt16LE(p + 32);
    if (zip.toString("utf-8", p + 46, p + 46 + nameLen) === name) {
      const local = zip.readUInt32LE(p + 42);
      const data = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
      const raw = zip.subarray(data, data + size);
      return method === 8 ? zlib.inflateRawSync(raw) : raw;
    }
    p = next;
  }
  return null;
}

/** Tweede Kamer: the Zaak's document (`did=` in the link) from the OData API, a .docx or a PDF. */
async function tweedeKamer(item: PolicyItem): Promise<string> {
  const did = /[?&]did=([^&]+)/.exec(item.link)?.[1];
  if (!did) return articleText(await (await get(item.link)).text());
  const base = "https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0";
  const meta = (await (
    await get(`${base}/Document?$filter=DocumentNummer eq '${did}'&$select=Id,ContentType`)
  ).json()) as { value: { Id: string; ContentType: string }[] };
  const doc = meta.value[0];
  if (!doc) throw new Error(`no document ${did}`);
  if (!doc.ContentType.includes("wordprocessingml")) throw new Error(`unsupported ${doc.ContentType}`);
  const xml = unzipEntry(
    Buffer.from(await (await get(`${base}/Document(${doc.Id})/resource`)).arrayBuffer()),
    "word/document.xml",
  );
  if (!xml) throw new Error("no word/document.xml");
  return xml
    .toString("utf-8")
    .split(/<\/w:p>/)
    .map((para) =>
      plainText([...para.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join(""), 100_000),
    )
    .filter(Boolean)
    .join("\n");
}

/** Federal Register: the abstract and the plain-text edition (the HTML pages block scrapers). */
async function federalRegister(item: PolicyItem): Promise<string> {
  const num = item.id.replace(/^us-fr:/, "");
  const doc = (await (
    await get(
      `https://www.federalregister.gov/api/v1/documents/${num}.json?fields[]=abstract&fields[]=raw_text_url`,
    )
  ).json()) as { abstract: string | null; raw_text_url: string | null };
  const raw = doc.raw_text_url ? plainText(await (await get(doc.raw_text_url)).text(), 100_000) : "";
  return [doc.abstract ?? "", raw].filter(Boolean).join("\n");
}

/** Have your say: the initiative's summary from the portal's backend (the page is a client-side app). */
async function haveYourSay(item: PolicyItem): Promise<string> {
  const id = item.id.replace(/^hys:/, "");
  const j = (await (
    await get(`https://ec.europa.eu/info/law/better-regulation/brpapi/groupInitiatives/${id}`)
  ).json()) as { shortTitle?: string; dossierSummary?: string };
  return [j.shortTitle ?? "", plainText(j.dossierSummary ?? "", 100_000)].filter(Boolean).join("\n");
}

/** EUR-Lex: the act's HTML rendition rather than the page around it. */
async function eurLex(item: PolicyItem): Promise<string> {
  const celex = item.id.replace(/^celex:/, "");
  const html = await (
    await get(`https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:${celex}`)
  ).text();
  return plainText(html, 100_000);
}

/** The item's full text, cut at BODY_MAX_CHARS; throws when it cannot be fetched. */
export async function fullText(item: PolicyItem): Promise<{ text: string; via: string }> {
  const [via, fn] = item.id.startsWith("tk:")
    ? ["tk-odata", tweedeKamer]
    : item.id.startsWith("us-fr:")
      ? ["fr-api", federalRegister]
      : item.id.startsWith("hys:")
        ? ["hys-api", haveYourSay]
        : item.id.startsWith("celex:")
          ? ["eurlex-html", eurLex]
          : ["article", async (i: PolicyItem) => articleText(await (await get(i.link)).text())];
  const text = squeeze((await fn(item)).replace(/\n+/g, " ¶ "))
    .replace(/ ¶ /g, "\n")
    .slice(0, BODY_MAX_CHARS);
  if (text.length < 80) throw new Error(`only ${text.length} characters`);
  return { text, via };
}
