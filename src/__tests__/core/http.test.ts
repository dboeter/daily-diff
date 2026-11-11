import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchOk } from "../../core/http.ts";

afterEach(() => vi.restoreAllMocks());

const status = (code: number) => new Response("", { status: code });
const stub = (...answers: (Response | Error)[]) => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  const spy = vi.spyOn(globalThis, "fetch");
  for (const a of answers) {
    if (a instanceof Error) spy.mockRejectedValueOnce(a);
    else spy.mockResolvedValueOnce(a);
  }
  return spy;
};
const get = (init: Parameters<typeof fetchOk>[1] = {}) =>
  fetchOk("https://example.org/feed?key=secret", { retryDelayMs: 0, ...init });

describe("fetchOk", () => {
  it("tries a GET once more after a 502, 503 or 504, and logs the host only (Open States, 2026-11-04)", async () => {
    for (const code of [502, 503, 504]) {
      const spy = stub(status(code), status(200));
      expect((await get()).status).toBe(200);
      expect(spy).toHaveBeenCalledTimes(2);
      expect(console.log).toHaveBeenCalledWith(`  [http] example.org: HTTP ${code}, retrying once`);
      vi.restoreAllMocks();
    }
  });

  it("tries once more after a timeout (Congress.gov, 2026-11-08)", async () => {
    const timeout = Object.assign(new Error("The operation was aborted due to timeout"), {
      name: "TimeoutError",
    });
    const spy = stub(timeout, status(200));
    expect((await get()).status).toBe(200);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("throws the second failure: one retry, not a loop", async () => {
    const spy = stub(status(503), status(503), status(200));
    await expect(get()).rejects.toThrow("HTTP 503");
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("does not retry another status, a network error, or a request that is not a GET", async () => {
    let spy = stub(status(404), status(200));
    await expect(get()).rejects.toThrow("HTTP 404");
    expect(spy).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
    spy = stub(new TypeError("fetch failed"), status(200));
    await expect(get()).rejects.toThrow("fetch failed");
    expect(spy).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
    spy = stub(status(503), status(200));
    await expect(get({ method: "POST", body: "q" })).rejects.toThrow("HTTP 503");
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
