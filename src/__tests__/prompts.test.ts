import { describe, it, expect } from "vitest";
import { formatItem, formatDiscussion, topN, topDiscussions, sampleNote } from "../prompts.ts";
import type { GitHubItem, GitHubDiscussion } from "../github.ts";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeItem(overrides: Partial<GitHubItem> = {}): GitHubItem {
  return {
    number: 1,
    title: "Test issue",
    state: "open",
    user: { login: "alice" },
    labels: [],
    created_at: "2026-03-09T00:00:00Z",
    updated_at: "2026-03-09T12:00:00Z",
    comments: 5,
    reactions: { "+1": 3 },
    body: "Some body text",
    html_url: "https://github.com/org/repo/issues/1",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// formatItem
// ---------------------------------------------------------------------------

describe("formatItem", () => {
  it("formats a basic item", () => {
    const result = formatItem(makeItem());
    expect(result).toContain("#1 [OPEN]");
    expect(result).toContain("Test issue");
    expect(result).toContain("Author: alice");
    expect(result).toContain("Comments: 5");
    expect(result).toContain("👍: 3");
    expect(result).toContain("URL: org/repo Issue #1");
    expect(result).toContain("Summary: Some body text");
  });

  it("includes labels when present", () => {
    const item = makeItem({ labels: [{ name: "bug" }, { name: "critical" }] });
    const result = formatItem(item);
    expect(result).toContain("[bug, critical]");
  });

  it("shows no label bracket when labels empty", () => {
    const result = formatItem(makeItem({ labels: [] }));
    expect(result).toContain("#1 [OPEN] Test issue");
    expect(result).not.toContain("[]");
  });

  it("truncates body at 300 chars with ellipsis", () => {
    const longBody = "A".repeat(400);
    const result = formatItem(makeItem({ body: longBody }));
    expect(result).toContain("A".repeat(300) + "...");
  });

  it("does not add ellipsis for body <= 300 chars", () => {
    const result = formatItem(makeItem({ body: "Short body" }));
    expect(result).toContain("Short body");
    expect(result).not.toContain("...");
  });

  it("handles null body gracefully", () => {
    const result = formatItem(makeItem({ body: null }));
    expect(result).toContain("Summary: ");
  });

  it("handles missing reactions gracefully", () => {
    const result = formatItem(makeItem({ reactions: undefined }));
    expect(result).toContain("👍: 0");
  });

  it("replaces newlines in body with spaces", () => {
    const result = formatItem(makeItem({ body: "line1\nline2\nline3" }));
    expect(result).toContain("line1 line2 line3");
  });

  it("shows closed state uppercase", () => {
    const result = formatItem(makeItem({ state: "closed" }));
    expect(result).toContain("[CLOSED]");
  });
});

// ---------------------------------------------------------------------------
// topN
// ---------------------------------------------------------------------------

describe("topN", () => {
  it("returns top N items sorted by comment count desc", () => {
    const items = [
      makeItem({ number: 1, comments: 2 }),
      makeItem({ number: 2, comments: 10 }),
      makeItem({ number: 3, comments: 5 }),
      makeItem({ number: 4, comments: 8 }),
    ];
    const result = topN(items, 2);
    expect(result).toHaveLength(2);
    expect(result[0]!.number).toBe(2);
    expect(result[1]!.number).toBe(4);
  });

  it("returns all items if n >= items.length", () => {
    const items = [makeItem({ comments: 1 }), makeItem({ comments: 2 })];
    expect(topN(items, 5)).toHaveLength(2);
  });

  it("does not mutate the original array", () => {
    const items = [makeItem({ comments: 1 }), makeItem({ comments: 5 })];
    const original = [...items];
    topN(items, 1);
    expect(items[0]!.comments).toBe(original[0]!.comments);
    expect(items[1]!.comments).toBe(original[1]!.comments);
  });

  it("returns empty array for empty input", () => {
    expect(topN([], 3)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// sampleNote
// ---------------------------------------------------------------------------

describe("sampleNote", () => {
  it("shows sampled note when total > sampled", () => {
    const result = sampleNote(50, 20);
    expect(result).toBe("(Total: 50 items; showing top 20 by comment count)");
  });

  it("shows total-only note when total <= sampled", () => {
    expect(sampleNote(8, 8)).toBe("(Total: 8 items)");
    expect(sampleNote(5, 10)).toBe("(Total: 5 items)");
  });

  it("names the engagement criterion when sampling discussions", () => {
    expect(sampleNote(100, 25, "engagement")).toBe(
      "(Total: 100 items; showing top 25 by comments + upvotes)",
    );
  });
});

// ---------------------------------------------------------------------------
// formatDiscussion
// ---------------------------------------------------------------------------

function makeDiscussion(overrides: Partial<GitHubDiscussion> = {}): GitHubDiscussion {
  return {
    number: 42,
    title: "Add a Pro plan",
    body: "Some discussion body",
    category: "Ideas",
    author: "alice",
    created_at: "2026-03-09T00:00:00Z",
    updated_at: "2026-03-09T12:00:00Z",
    comments: 4,
    upvotes: 16,
    answered: false,
    html_url: "https://github.com/org/repo/discussions/42",
    ...overrides,
  };
}

describe("formatDiscussion", () => {
  it("formats a discussion", () => {
    const result = formatDiscussion(makeDiscussion());
    expect(result).toContain("#42 [Ideas]");
    expect(result).toContain("Add a Pro plan");
    expect(result).toContain("Author: alice");
    expect(result).toContain("Comments: 4");
    expect(result).toContain("👍: 16");
    expect(result).toContain("URL: org/repo Discussion #42");
    expect(result).toContain("Summary: Some discussion body");
  });

  it("flags answered threads", () => {
    expect(formatDiscussion(makeDiscussion({ answered: true }))).toContain("[ANSWERED]");
  });

  it("never emits a full github.com URL", () => {
    expect(formatDiscussion(makeDiscussion())).not.toContain("https://github.com");
  });

  it("truncates long bodies", () => {
    const result = formatDiscussion(makeDiscussion({ body: "x".repeat(400) }));
    expect(result).toContain("...");
    expect(result).not.toContain("x".repeat(301));
  });
});

// ---------------------------------------------------------------------------
// topDiscussions
// ---------------------------------------------------------------------------

describe("topDiscussions", () => {
  it("ranks by comments + upvotes combined", () => {
    const items = [
      makeDiscussion({ number: 1, comments: 0, upvotes: 20 }),
      makeDiscussion({ number: 2, comments: 30, upvotes: 0 }),
      makeDiscussion({ number: 3, comments: 5, upvotes: 5 }),
    ];
    expect(topDiscussions(items, 3).map((d) => d.number)).toEqual([2, 1, 3]);
  });

  it("takes at most n items and does not mutate the input", () => {
    const items = [
      makeDiscussion({ number: 1, comments: 1, upvotes: 0 }),
      makeDiscussion({ number: 2, comments: 9, upvotes: 0 }),
    ];
    expect(topDiscussions(items, 1).map((d) => d.number)).toEqual([2]);
    expect(items.map((d) => d.number)).toEqual([1, 2]);
  });
});
