import { describe, expect, it } from "vitest";
import { momentumRatio, rankNpmPackages, type NpmSearchObject } from "../../trending/npm.ts";

const obj = (name: string, weekly: number, monthly: number): NpmSearchObject => ({
  downloads: { weekly, monthly },
  package: { name, description: `${name} desc`, date: "2026-03-07T12:00:00Z" },
});

describe("momentumRatio", () => {
  it("is ~1 for a steady package and 0 without monthly downloads", () => {
    expect(momentumRatio({ weekly: 7_000, monthly: 30_000 })).toBeCloseTo(1);
    expect(momentumRatio({ weekly: 100, monthly: 0 })).toBe(0);
  });
});

describe("rankNpmPackages", () => {
  it("splits rising (ratio ≥ 2, weekly ≥ 10k) from top, without overlap", () => {
    const { rising, top } = rankNpmPackages([
      obj("steady-big", 1_000_000, 4_300_000),
      obj("new-hot", 50_000, 50_000),
      obj("new-small", 9_000, 9_000),
      obj("surging", 20_000, 40_000),
    ]);
    expect(rising.map((p) => p.name)).toEqual(["new-hot", "surging"]);
    expect(top.map((p) => p.name)).toEqual(["steady-big", "new-small"]);
  });

  it("dedupes packages returned by several keywords and fills defaults", () => {
    const { top } = rankNpmPackages([obj("a", 5, 20), obj("a", 5, 20), { package: { name: "b" } }]);
    expect(top).toHaveLength(2);
    expect(top[1]).toMatchObject({
      name: "b",
      weekly: 0,
      description: "",
      url: "https://www.npmjs.com/package/b",
      lastPublish: "",
    });
    expect(top[0]!.lastPublish).toBe("2026-03-07");
  });

  it("caps both lists at 15", () => {
    const many = Array.from({ length: 40 }, (_, i) => obj(`p${i}`, 20_000 + i, i < 20 ? 20_000 : 100_000));
    const { rising, top } = rankNpmPackages(many);
    expect(rising).toHaveLength(15);
    expect(top).toHaveLength(15);
  });
});
