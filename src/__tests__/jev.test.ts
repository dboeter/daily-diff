import { describe, expect, it } from "vitest";
import { retryDelayMs } from "../jev.ts";

describe("Jev client", () => {
  it("honors retry-after and otherwise backs off exponentially, capped", () => {
    expect(retryDelayMs("2", 0)).toBe(2000);
    expect(retryDelayMs("600", 0)).toBe(10_000);
    expect(retryDelayMs(null, 0)).toBe(1000);
    expect(retryDelayMs(null, 2)).toBe(4000);
    expect(retryDelayMs("Wed, 21 Oct 2026 07:28:00 GMT", 1)).toBe(2000);
  });
});
