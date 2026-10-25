/**
 * The Commission's "Shaping Europe's Digital Future website updates" mailing
 * (CNECT newsroom), read from an AgentMail inbox (`AGENTMAIL_API_KEY`). The
 * site's RSS feed (config.yml, "European Commission") is a curated subset: on
 * 2026-10-19..23 it carried 3 of the mailing's 12 items and missed two AI Act
 * items (GPAI external evaluators, the fundamental-rights request channel).
 */

import type { PolicyItem } from "./items.ts";
import type { PolicySourceContext } from "./sources.ts";
import { apiKeyFor, FETCH_TIMEOUT_MS, fetchOk } from "../core/http.ts";
import { NEWS_MAX_AGE_DAYS, plainText } from "../core/rss.ts";
import { DAY_MS } from "../core/date.ts";

const API = "https://api.agentmail.to/v0";

/** Each item ends in a "more" link through this redirect; other links (social, unsubscribe) are not items. */
const ITEM_LINK_RE = /<a[^>]*href="(https:\/\/ec\.europa\.eu\/newsroom\/dae\/redirection\/item\/\d+[^"]*)"/g;

export interface MailItem {
  title: string;
  description: string;
  /** The newsroom redirect; resolved to the page URL before it becomes an id. */
  redirect: string;
}

/**
 * The mailing's items: an `<h4>` title, a `<span>` teaser, then the redirect.
 * The text between two redirects belongs to the second item.
 */
export function parseMailItems(html: string): MailItem[] {
  const items: MailItem[] = [];
  let from = 0;
  for (const m of html.matchAll(ITEM_LINK_RE)) {
    const chunk = html.slice(from, m.index);
    from = m.index + m[0].length;
    const titles = [...chunk.matchAll(/<h4[^>]*>([\s\S]*?)<\/h4>/g)];
    const last = titles.at(-1);
    if (!last) continue;
    const after = chunk.slice(last.index + last[0].length);
    const teaser = after.match(/<span[^>]*>([\s\S]*?)<\/span>/);
    items.push({
      title: plainText(last[1]!),
      description: teaser ? plainText(teaser[1]!) : "",
      redirect: m[1]!.replace(/&amp;/g, "&"),
    });
  }
  return items;
}

interface Message {
  message_id: string;
  timestamp: string;
}

async function getJson<T>(url: string, key: string): Promise<T> {
  return (await (await fetchOk(url, { headers: { Authorization: `Bearer ${key}` } })).json()) as T;
}

const SITE = "https://digital-strategy.ec.europa.eu";

/** The Drupal node of a digital-strategy page, from its settings JSON ("currentPath":"node\/17580"). */
const NODE_RE = /"currentPath":"node\\\/(\d+)"/;

/**
 * The redirect's target page and the item's id. The site's RSS feed keys its items on the Drupal
 * guid ("17580 at https://digital-strategy.ec.europa.eu"), so a page of the site gets that id: the
 * mail's copy of an RSS item is then the same item, in this run and in the reported state. Any
 * status will do: the Funding & Tenders portal answers 404 to this client after redirecting.
 * Null when the redirect fails or a site page shows no node: a fallback id would differ from the
 * next night's and report the item twice, so it waits for a later run within the news window.
 */
async function resolve(redirect: string): Promise<{ link: string; id: string } | null> {
  try {
    const res = await fetch(redirect, {
      headers: { "User-Agent": "daily-diff/1.0" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const link = res.url.split("?")[0];
    if (!link) throw new Error("no target URL");
    if (!link.startsWith(SITE)) return { link, id: link };
    const node = (await res.text()).match(NODE_RE)?.[1];
    if (!node) throw new Error(`HTTP ${res.status}, no node id on ${link}`);
    return { link, id: `${node} at ${SITE}` };
  } catch (err) {
    console.error(`  [policy] Commission mail: ${redirect} skipped this run: ${err}`);
    return null;
  }
}

/**
 * Mail of every inbox on the key from the news age window; a message without item links adds nothing.
 * The message list is newest first (live, 2026-10-25), so `limit=100` always holds the window's ~7 mails.
 */
export async function fetchCommissionMail(ctx: PolicySourceContext): Promise<PolicyItem[]> {
  const key = apiKeyFor("AGENTMAIL_API_KEY", "Commission mail");
  if (!key) return [];
  const oldest = ctx.now.getTime() - NEWS_MAX_AGE_DAYS * DAY_MS;
  const { inboxes } = await getJson<{ inboxes: { inbox_id: string }[] }>(`${API}/inboxes`, key);
  // Redirect → the item and the earliest mail that carried it.
  const byRedirect = new Map<string, MailItem & { published: string }>();
  for (const { inbox_id } of inboxes) {
    const inbox = `${API}/inboxes/${encodeURIComponent(inbox_id)}/messages`;
    const { messages } = await getJson<{ messages: Message[] }>(`${inbox}?limit=100`, key);
    const recent = messages.filter((m) => Date.parse(m.timestamp) >= oldest);
    const bodies = await Promise.all(
      recent.map((m) => getJson<{ html?: string }>(`${inbox}/${encodeURIComponent(m.message_id)}`, key)),
    );
    recent.forEach((msg, n) => {
      for (const item of parseMailItems(bodies[n]!.html ?? "")) {
        const known = byRedirect.get(item.redirect);
        if (!known || msg.timestamp < known.published)
          byRedirect.set(item.redirect, { ...item, published: msg.timestamp });
      }
    });
  }
  // One request per item, in parallel: a hung host then costs one timeout, not one per item.
  const items = [...byRedirect.values()];
  const targets = await Promise.all(items.map((i) => resolve(i.redirect)));
  const byId = new Map<string, PolicyItem>();
  items.forEach((item, n) => {
    const target = targets[n];
    if (!target || byId.has(target.id)) return;
    byId.set(target.id, {
      id: target.id,
      title: item.title,
      link: target.link,
      published: item.published,
      description: item.description,
      // As the site's RSS feed (config.yml): the duplicate of an RSS item is then judged the same way.
      source: "European Commission",
      jurisdiction: "eu",
      jevOnly: false,
    });
  });
  return [...byId.values()];
}
