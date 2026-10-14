import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  newPolicyItems,
  nextPolicyState,
  loadPolicyState,
  savePolicyState,
  fetchPolicyData,
  type PolicyItem,
} from "../policy.ts";

const item = (id: string, published = "2026-10-13T08:00:00.000Z"): PolicyItem => ({
  id,
  title: `Title ${id}`,
  link: `https://example.eu/${id}`,
  published,
  description: "",
  source: "Commission",
});

describe("newPolicyItems", () => {
  it("everything is new without state", () => {
    expect(newPolicyItems([item("a"), item("b")], null, "2026-10-14").map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("skips items an earlier day reported", () => {
    const state = { reported: { a: "2026-10-13" } };
    expect(newPolicyItems([item("a"), item("b")], state, "2026-10-14").map((i) => i.id)).toEqual(["b"]);
  });

  it("a same-day re-run reports the same items again", () => {
    const state = nextPolicyState(null, [item("a"), item("b")], "2026-10-14");
    expect(newPolicyItems([item("a"), item("b")], state, "2026-10-14").map((i) => i.id)).toEqual(["a", "b"]);
  });
});

describe("nextPolicyState", () => {
  it("records each reported item with the day it was first reported", () => {
    const state = nextPolicyState({ reported: { a: "2026-10-13" } }, [item("b")], "2026-10-14");
    expect(state.reported).toEqual({ a: "2026-10-13", b: "2026-10-14" });
  });

  it("keeps the first-reported day on a same-day re-run", () => {
    const state = nextPolicyState({ reported: { a: "2026-10-14" } }, [item("a")], "2026-10-14");
    expect(state.reported).toEqual({ a: "2026-10-14" });
  });

  it("prunes ids reported more than 30 days ago", () => {
    const state = nextPolicyState({ reported: { old: "2026-09-13", kept: "2026-09-14" } }, [], "2026-10-14");
    expect(state.reported).toEqual({ kept: "2026-09-14" });
  });
});

describe("policy state file", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "policy-state-"));
  const file = path.join(dir, "policy-state.json");

  it("round-trips", () => {
    savePolicyState({ reported: { a: "2026-10-14" } }, file);
    expect(loadPolicyState(file)).toEqual({ reported: { a: "2026-10-14" } });
  });

  it("missing or malformed reads as no state", () => {
    expect(loadPolicyState(path.join(dir, "missing.json"))).toBeNull();
    fs.writeFileSync(file, "{ not json");
    expect(loadPolicyState(file)).toBeNull();
    fs.writeFileSync(file, '{"reported": []}');
    expect(loadPolicyState(file)).toBeNull();
  });
});

describe("fetchPolicyData", () => {
  afterEach(() => vi.restoreAllMocks());
  const feeds = [{ name: "Commission", url: "https://example.eu/rss.xml" }];
  const rss = (ids: [string, string][]) =>
    `<rss><channel>${ids
      .map(
        ([id, date]) =>
          `<item><title>${id}</title><link>https://x/${id}</link><guid>${id}</guid><pubDate>${date}</pubDate></item>`,
      )
      .join("")}</channel></rss>`;

  it("keeps new items within the news age limit, tagged with their feed", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        rss([
          ["new", "Tue, 13 Oct 2026 08:00:00 +0000"],
          ["seen", "Mon, 12 Oct 2026 08:00:00 +0000"],
          ["stale", "Mon, 05 Oct 2026 08:00:00 +0000"],
        ]),
      ),
    );
    const data = await fetchPolicyData(feeds, new Date("2026-10-13T23:00:00Z"), "2026-10-14", {
      reported: { seen: "2026-10-13" },
    });
    expect(data.fetchSuccess).toBe(true);
    expect(data.items.map((i) => [i.id, i.source])).toEqual([["new", "Commission"]]);
    expect(data.nextState.reported).toEqual({ seen: "2026-10-13", new: "2026-10-14" });
  });

  it("reports a failed feed as fetchSuccess false instead of throwing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 503 }));
    const data = await fetchPolicyData(feeds, new Date("2026-10-13T23:00:00Z"), "2026-10-14", null);
    expect(data.fetchSuccess).toBe(false);
    expect(data.items).toEqual([]);
  });
});
