import { describe, expect, it } from "vitest";
import { parseTrendingHtml } from "../trending.ts";

const SAMPLE_HTML = `
<main>
  <div class="Box">
    <article class="Box-row">
      <h2 class="h3 lh-condensed">
        <a href="/owner1/repo-alpha">owner1 / repo-alpha</a>
      </h2>
      <p class="col-9 color-fg-muted my-1 pr-4">
        A fast inference engine for large models.
      </p>
      <div class="f6 color-fg-muted mt-2">
        <span class="d-inline-block ml-0 mr-3">
          <span itemprop="programmingLanguage">Python</span>
        </span>
        <a href="/owner1/repo-alpha/stargazers" class="LinkLink--muted d-inline-block mr-3">
          <svg class="octicon"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815"></path></svg> 12,500
        </a>
        <a href="/owner1/repo-alpha/forks" class="LinkLink--muted d-inline-block mr-3">
          <svg class="octicon"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815"></path></svg> 1,234
        </a>
        <span class="d-inline-block float-sm-right">
          523 stars today
        </span>
      </div>
    </article>
    <article class="Box-row">
      <h2 class="h3 lh-condensed">
        <a href="/owner2/repo-beta">owner2 / repo-beta</a>
      </h2>
      <p class="col-9 color-fg-muted my-1 pr-4">
        Rust-based developer CLI.
      </p>
      <div class="f6 color-fg-muted mt-2">
        <span class="d-inline-block ml-0 mr-3">
          <span itemprop="programmingLanguage">Rust</span>
        </span>
        <a href="/owner2/repo-beta/stargazers" class="LinkLink--muted d-inline-block mr-3">
          <svg class="octicon"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815"></path></svg> 850
        </a>
        <a href="/owner2/repo-beta/forks" class="LinkLink--muted d-inline-block mr-3">
          <svg class="octicon"><path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815"></path></svg> 42
        </a>
        <span class="d-inline-block float-sm-right">
          88 stars today
        </span>
      </div>
    </article>
  </div>
</main>
`;

describe("parseTrendingHtml", () => {
  it("parses multiple trending repository cards", () => {
    const repos = parseTrendingHtml(SAMPLE_HTML);
    expect(repos).toHaveLength(2);

    expect(repos[0]).toEqual({
      fullName: "owner1/repo-alpha",
      description: "A fast inference engine for large models.",
      language: "Python",
      todayStars: 523,
      totalStars: 12500,
      forks: 1234,
      url: "https://github.com/owner1/repo-alpha",
    });

    expect(repos[1]).toEqual({
      fullName: "owner2/repo-beta",
      description: "Rust-based developer CLI.",
      language: "Rust",
      todayStars: 88,
      totalStars: 850,
      forks: 42,
      url: "https://github.com/owner2/repo-beta",
    });
  });

  it("handles empty or irrelevant HTML without errors", () => {
    expect(parseTrendingHtml("<html><body>No articles here</body></html>")).toEqual([]);
  });

  it("handles articles with missing optional fields gracefully", () => {
    const minimalHtml = `
      <article class="Box-row">
        <h2><a href="/owner/minimal">owner / minimal</a></h2>
      </article>
    `;
    const repos = parseTrendingHtml(minimalHtml);
    expect(repos).toHaveLength(1);
    expect(repos[0]?.fullName).toBe("owner/minimal");
    expect(repos[0]?.description).toBe("");
    expect(repos[0]?.language).toBe("");
    expect(repos[0]?.todayStars).toBe(0);
    expect(repos[0]?.totalStars).toBe(0);
    expect(repos[0]?.forks).toBe(0);
  });

  it("does not read the forks count as total stars when the stargazers link has no number", () => {
    const html = `
      <article class="Box-row">
        <h2><a href="/owner/nostars">owner / nostars</a></h2>
        <a href="/owner/nostars/stargazers"><svg><path d="M8 .25a.75"></path></svg></a>
        <a href="/owner/nostars/forks"><svg><path d="M5 5.372v.878"></path></svg> 77</a>
      </article>
    `;
    const repos = parseTrendingHtml(html);
    expect(repos[0]?.totalStars).toBe(0);
    expect(repos[0]?.forks).toBe(77);
  });
});
