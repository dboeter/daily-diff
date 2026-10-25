import fs from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PolicyConfig } from "../../core/config.ts";
import { fetchCommissionMail, parseMailItems } from "../../policy/commission-mail.ts";

// The mailing of 2026-10-21, as AgentMail returned its `html`.
const HTML = fs.readFileSync(new URL("../fixtures/cnect-newsroom-mail.html", import.meta.url), "utf-8");

const REDIRECT = "https://ec.europa.eu/newsroom/dae/redirection/item/";
const NOW = new Date("2026-10-22T00:00:00Z");

describe("parseMailItems", () => {
  const items = parseMailItems(HTML);

  it("reads each item's title, teaser and redirect, in mail order", () => {
    expect(items.map((i) => i.title)).toEqual([
      "Commission to investigate how Booking.com combats scams and fraud under the Digital Services Act",
      "Commission holds regulatory dialogue on the out-of-court dispute settlement mechanism under the DSA",
      "Requirements for qualified independent external evaluators of General-Purpose AI models",
    ]);
    expect(items[0]!.description).toMatch(/^Today, the European Commission has opened formal proceedings/);
    expect(items[0]!.redirect).toBe(`${REDIRECT}961653/en/2549`);
  });

  it("finds no items in a mail without item links (the subscription confirmation)", () => {
    expect(parseMailItems("<h4>Welcome</h4><a href='https://ec.europa.eu/newsroom'>Unsubscribe</a>")).toEqual(
      [],
    );
  });
});

describe("fetchCommissionMail", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });
  const ctx = { config: {} as PolicyConfig, now: NOW, dateStr: "2026-10-22", state: null };

  const redirected = (url: string, html = "<html></html>") => {
    const res = new Response(html);
    Object.defineProperty(res, "url", { value: url });
    return res;
  };
  // A digital-strategy page's Drupal settings, as the site serves them.
  const page = (node: number) =>
    `<script type="application/json">{"path":{"currentPath":"node\\/${node}","currentPathIsAdmin":false}}</script>`;

  it("skips without AGENTMAIL_API_KEY", async () => {
    vi.stubEnv("AGENTMAIL_API_KEY", "");
    vi.spyOn(console, "log").mockImplementation(() => {});
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    expect(await fetchCommissionMail(ctx)).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("maps recent mail to EU items keyed like the site's RSS feed, once per item", async () => {
    vi.stubEnv("AGENTMAIL_API_KEY", "k");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("/inboxes")) return Response.json({ inboxes: [{ inbox_id: "a@agentmail.to" }] });
      if (url.includes("/messages?"))
        return Response.json({
          messages: [
            { message_id: "<new>", timestamp: "2026-10-21T15:09:24.000Z" },
            // The same items a day earlier: one row per item.
            { message_id: "<dup>", timestamp: "2026-10-20T15:09:24.000Z" },
            // Outside the 7-day news window: never fetched.
            { message_id: "<old>", timestamp: "2026-10-01T15:09:24.000Z" },
          ],
        });
      if (url.includes("/messages/")) return Response.json({ html: HTML });
      // 961628: a page off the site, keyed on its link; the others are site pages, keyed on their node.
      const item = Number(url.split("/item/")[1]!.split("/")[0]);
      if (item === 961628) return redirected("https://smart-networks.europa.eu/6g/");
      return redirected(`https://digital-strategy.ec.europa.eu/en/page-${item}?x=1`, page(item - 944067));
    });
    const items = await fetchCommissionMail(ctx);
    expect(items.map((i) => i.id)).toEqual([
      "17586 at https://digital-strategy.ec.europa.eu",
      "https://smart-networks.europa.eu/6g/",
      "17594 at https://digital-strategy.ec.europa.eu",
    ]);
    expect(items[2]).toEqual({
      id: "17594 at https://digital-strategy.ec.europa.eu",
      title: "Requirements for qualified independent external evaluators of General-Purpose AI models",
      link: "https://digital-strategy.ec.europa.eu/en/page-961661",
      published: "2026-10-21T15:09:24.000Z",
      description: expect.any(String),
      source: "European Commission",
      jurisdiction: "eu",
      jevOnly: false,
    });
    const urls = fetchSpy.mock.calls.map(([u]) => String(u));
    expect(urls.some((u) => u.includes("%3Cold%3E"))).toBe(false);
    expect((fetchSpy.mock.calls[0]![1]?.headers as Record<string, string>)["Authorization"]).toBe("Bearer k");
  });

  it("keeps the redirect as the link when it does not resolve", async () => {
    vi.stubEnv("AGENTMAIL_API_KEY", "k");
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("/inboxes")) return Response.json({ inboxes: [{ inbox_id: "a" }] });
      if (url.includes("/messages?"))
        return Response.json({ messages: [{ message_id: "m", timestamp: "2026-10-21T15:09:24.000Z" }] });
      if (url.includes("/messages/")) return Response.json({ html: HTML });
      throw new TypeError("fetch failed");
    });
    expect((await fetchCommissionMail(ctx))[0]!.link).toBe(`${REDIRECT}961653/en/2549`);
  });

  it("throws when the mail API fails, so the run counts the source as failed", async () => {
    vi.stubEnv("AGENTMAIL_API_KEY", "k");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 401 }));
    await expect(fetchCommissionMail(ctx)).rejects.toThrow("HTTP 401");
  });
});
