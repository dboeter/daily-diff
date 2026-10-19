import fs from "node:fs";
import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchInternetConsultatie, parseConsultations } from "../policy/internetconsultatie.ts";
import type { PolicySourceContext } from "../policy/sources.ts";

const HOMEPAGE = fs.readFileSync(new URL("./fixtures/internetconsultatie.html", import.meta.url), "utf-8");

const entry = (slug: string, title: string, summary: string) => `
  <li>
    <h3 class="result--title "><a href="/${slug}/b1" class="result--title">${title}</a></h3>
    <ul class="list--metadata">
      <li>Sluitingsdatum:
      01-12-2026</li>
      <li>Ministerie van Binnenlandse Zaken en Koninkrijksrelaties</li></ul>
    <p><p>${summary}</p></p>
  </li>`;

const page = (...entries: string[]) => `<div class="result--list "><ul>${entries.join("")}</ul></div>`;

const ctx = { dateStr: "2026-10-14" } as PolicySourceContext;

afterEach(() => vi.restoreAllMocks());

describe("parseConsultations", () => {
  it("reads every listed consultation from the live homepage, not the featured cards", () => {
    const list = parseConsultations(HOMEPAGE);
    expect(list.map((c) => c.slug)).toEqual([
      "regelingbanenafspraak",
      "kindeerst",
      "wijzigingsregelingwaadinormenkader",
      "mirt_projecten_projectpakketten_woningbouw",
      "bevoegdheidsuitoefening",
    ]);
    expect(list[0]).toMatchObject({
      title: "Regeling banenafspraak",
      closes: "2026-11-09",
      ministry: "Ministerie van Sociale Zaken en Werkgelegenheid",
    });
    expect(list[0]!.summary).toMatch(/^Voor de lagere regelgeving bij de Wet banenafspraak/);
  });

  it("throws when nothing parses: the markup changed", () => {
    expect(() => parseConsultations("<html><body>Onderhoud</body></html>")).toThrow("no consultations");
  });
});

describe("fetchInternetConsultatie", () => {
  it("keeps the AI consultations as open-consultation stage items dated by their start, closing date as deadline", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input) =>
        String(input).endsWith("/aiverordening/b1")
          ? new Response(`<tr><th scope="row">Startdatum consultatie</th>\n<td>\n 02-10-2026</td></tr>`)
          : new Response(
              page(
                entry("aiverordening", "Uitvoeringswet AI-verordening", "Toezicht op AI-systemen."),
                entry("banen", "Regeling banenafspraak", "Technische wijzigingen."),
                entry("thai", "Besluit THAI-onderwijs", "Geen kunstmatige… wel thai."),
              ),
            ),
      );
    const items = await fetchInternetConsultatie(ctx);
    expect(items).toEqual([
      {
        id: "internetconsultatie:aiverordening",
        title: "Uitvoeringswet AI-verordening",
        link: "https://www.internetconsultatie.nl/aiverordening/b1",
        published: "2026-10-02",
        description: "Ministerie van Binnenlandse Zaken en Koninkrijksrelaties. Toezicht op AI-systemen.",
        source: "Internetconsultatie",
        jurisdiction: "nl",
        jevOnly: false,
        stage: "Open for consultation",
        deadline: "2026-12-01",
      },
    ]);
    // The detail page is fetched for the AI consultation only.
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws on an HTTP error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("", { status: 503 }));
    await expect(fetchInternetConsultatie(ctx)).rejects.toThrow("HTTP 503");
  });
});
